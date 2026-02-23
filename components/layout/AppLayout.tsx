'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { Loader2 } from 'lucide-react'
import { QuickCapture } from '@/components/QuickCapture'
import { CapacityIndicator } from '@/components/CapacityIndicator'

interface User {
    id: string; nome: string; username: string
    funcao: 'TI' | 'Marketing' | 'Admin'; is_admin_matriz: boolean
}

type Theme = 'light' | 'dark'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [theme, setTheme] = useState<Theme>('light')
    const router = useRouter()

    useEffect(() => {
        const saved = (localStorage.getItem('theme') as Theme) || 'light'
        setTheme(saved)
        document.documentElement.setAttribute('data-theme', saved)
    }, [])

    useEffect(() => {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (data.user) setUser(data.user)
                else router.replace('/login')
            })
            .catch(() => router.replace('/login'))
            .finally(() => setLoading(false))
    }, [router])

    const toggleTheme = () => {
        const next: Theme = theme === 'light' ? 'dark' : 'light'
        setTheme(next)
        localStorage.setItem('theme', next)
        document.documentElement.setAttribute('data-theme', next)
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.replace('/login')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Carregando...</p>
            </div>
        </div>
    )

    if (!user) return null

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <div style={{ flexShrink: 0, height: '100vh', position: 'sticky', top: 0 }}>
                <Sidebar user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
            </div>
            <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)', position: 'relative' }}>
                <div style={{ position: 'sticky', top: 0, right: 0, padding: '1rem 2.5rem', display: 'flex', justifyContent: 'flex-end', background: 'var(--bg-primary)', zIndex: 10, borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '200px' }}>
                        <CapacityIndicator userId={user.id} userName={user.nome} />
                    </div>
                </div>
                <div style={{ padding: '2rem 2.5rem' }}>{children}</div>
                <QuickCapture />
            </main>
        </div>
    )
}
