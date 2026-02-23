'use client'

import { useState, useEffect } from 'react'
import { Activity } from 'lucide-react'

export function CapacityIndicator({ userId, userName }: { userId: string, userName?: string }) {
    const [stats, setStats] = useState({ logged: 0, capacity: 40 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCapacity = async () => {
            try {
                // 1. Get user configuration
                const userRes = await fetch('/api/auth/me')
                const userData = await userRes.json()
                const capacity = userData.user?.capacidade_semanal_horas || 40

                // 2. Get all hours logged this week attached to this user
                const clientesRes = await fetch('/api/clientes')
                const clientes = await clientesRes.json()

                let totalLogged = 0
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                startOfWeek.setHours(0, 0, 0, 0);

                // Assuming hours are global or we fetch global /api/horas (mock fetch)
                for (const c of clientes) {
                    const horasRes = await fetch(`/api/clientes/${c.id}/horas`)
                    const horasArray = await horasRes.json()
                    const loggedForClient = horasArray
                        .filter((h: any) => new Date(h.data) >= startOfWeek /* && h.usuario_id === userId */) // Since the system currently doesn't map hours strict to user in mock DB, we sum all for MVP
                        .reduce((acc: number, curr: any) => acc + (Number(curr.horas) || 0), 0)
                    totalLogged += loggedForClient
                }

                setStats({ logged: totalLogged, capacity })
            } catch (e) {
                console.error("Erro ao carregar capacidade:", e)
            } finally {
                setLoading(false)
            }
        }

        fetchCapacity()
        const interval = setInterval(fetchCapacity, 120_000) // Update every 2 mins
        return () => clearInterval(interval)
    }, [userId])

    if (loading) return null

    const pct = Math.min(100, (stats.logged / stats.capacity) * 100)
    const isOver = stats.logged >= stats.capacity
    const isWarning = pct > 85

    const color = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981'
    const bg = isOver ? '#fee2e2' : isWarning ? '#fef3c7' : '#d1fae5'

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', padding: '0.5rem 0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Capacidade Semanal
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, color }}>{stats.logged.toFixed(1)} / {stats.capacity}h</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 1s ease-out', borderRadius: '99px' }} />
            </div>
        </div>
    )
}
