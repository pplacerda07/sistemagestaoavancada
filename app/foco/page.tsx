'use client'

import { useState, useEffect } from 'react'
import { SmartTaskQueue } from '@/components/SmartTaskQueue'
import { LayoutDashboard, CheckSquare, AlertTriangle, Clock } from 'lucide-react'

export default function FocusDashboard() {
    const [stats, setStats] = useState({ vaoVencer: 0, concluidasHoje: 0, alertas: 0 })

    useEffect(() => {
        const load = async () => {
            try {
                const todayStr = new Date().toISOString().split('T')[0]
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                const tomorrowStr = tomorrow.toISOString().split('T')[0]

                // Tasks
                const resT = await fetch('/api/tarefas')
                const allTasks = await resT.json()

                const vaoVencer = allTasks.filter((t: any) => t.status !== 'concluida' && (t.prazo === todayStr || t.prazo === tomorrowStr)).length
                // Quick hack for concluida hoje: Assuming if it's completed and deadline is today, or we just count all completed for MVP since we don't track state change exactly yet.
                const concluidasHoje = allTasks.filter((t: any) => t.status === 'concluida' && t.prazo && t.prazo <= todayStr).length

                // Alerts
                const resA = await fetch('/api/alertas')
                const allAlertas = await resA.json()
                const urgentes = allAlertas.filter((a: any) => a.urgente).length

                setStats({ vaoVencer, concluidasHoje, alertas: urgentes })
            } catch (e) {
                console.error(e)
            }
        }
        load()
    }, [])

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <LayoutDashboard size={24} style={{ color: 'var(--color-purple-500)' }} /> Modo Foco
                    </h1>
                    <p className="page-subtitle">Seu resumo inteligente do dia. Tudo o que precisa da sua atenção agora.</p>
                </div>
            </div>

            {/* Top Widgets */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f59e0b15', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.vaoVencer}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Vencendo hoje/amanhã</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ef444415', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.alertas}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Alertas urgentes</p>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-secondary)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#10b98115', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckSquare size={24} />
                    </div>
                    <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{stats.concluidasHoje}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Entregues hoje (mock)</p>
                    </div>
                </div>
            </div>

            {/* Smart Priority Queue */}
            <SmartTaskQueue />
        </div>
    )
}
