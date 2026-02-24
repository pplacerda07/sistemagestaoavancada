'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/layout/Sidebar'
import { Loader2, Menu, X, Zap, Bell, CheckSquare, DollarSign } from 'lucide-react'
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [alertCount, setAlertCount] = useState(0)

    const router = useRouter()
    const pathname = usePathname()

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

    useEffect(() => {
        if (!user) return
        const load = () =>
            fetch('/api/alertas')
                .then(r => r.json())
                .then(d => setAlertCount(Array.isArray(d) ? d.length : 0))
                .catch(() => { })
        load()
        const interval = setInterval(load, 60_000)
        return () => clearInterval(interval)
    }, [user])

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

    // Restricted mobile navigation
    const mobileNavItems = [
        { href: '/tarefas', label: 'Tarefas', icon: CheckSquare, adminOnly: false },
        { href: '/financeiro', label: 'Financeiro', icon: DollarSign, adminOnly: true },
        { href: '/alertas', label: 'Alertas', icon: Bell, adminOnly: false, count: alertCount }
    ]

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] w-full">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex shrink-0 h-screen sticky top-0 z-40">
                <Sidebar user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
            </div>

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Slide-over Menu */}
            <div className={`fixed inset-y-0 left-0 w-[240px] bg-[var(--sidebar-bg)] z-[60] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col border-r border-white/10 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5 border-b border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] shrink-0 bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.4)]">
                            <Zap size={16} color="white" fill="white" />
                        </div>
                        <div>
                            <p className="text-[0.875rem] font-bold text-white leading-tight">Fiora App</p>
                        </div>
                    </div>
                    <button onClick={() => setMobileMenuOpen(false)} className="text-white/60 p-1">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
                    {mobileNavItems.map(item => {
                        if (item.adminOnly && !user.is_admin_matriz) return null
                        const isActive = pathname.startsWith(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[0.625rem] text-[0.825rem] transition-all duration-150 border-l-2
                                    ${isActive
                                        ? 'bg-[var(--sidebar-active)] font-semibold text-white border-purple-400'
                                        : 'bg-transparent font-medium text-white/50 border-transparent'
                                    }`}
                            >
                                <div className="relative flex">
                                    <item.icon size={17} className={isActive ? 'opacity-100' : 'opacity-60'} />
                                    {!!item.count && item.count > 0 && (
                                        <span className="absolute -top-[5px] -right-[7px] bg-red-500 text-white text-[0.55rem] font-extrabold min-w-[14px] h-[14px] rounded-full flex items-center justify-center px-[3px] leading-none">
                                            {item.count > 99 ? '99+' : item.count}
                                        </span>
                                    )}
                                </div>
                                {item.label}
                                {!!item.count && item.count > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full">
                                        {item.count}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col relative overflow-hidden w-full">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-[var(--sidebar-bg)] border-b border-white/10 shrink-0 sticky top-0 z-30">
                    <button onClick={() => setMobileMenuOpen(true)} className="text-white">
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg shrink-0 bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shadow-[0_4px_12px_rgba(124,58,237,0.4)]">
                            <Zap size={14} color="white" fill="white" />
                        </div>
                    </div>
                </header>

                {/* Desktop Topbar */}
                <div className="hidden md:flex sticky top-0 right-0 py-4 px-10 justify-end bg-[var(--bg-primary)] z-10 border-b border-[var(--border)] shrink-0">
                    <div className="w-[200px]">
                        <CapacityIndicator userId={user.id} userName={user.nome} />
                    </div>
                </div>

                {/* Content Container (Scrollable) */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-10 w-full relative">
                    {children}
                </div>

                <QuickCapture />
            </main>
        </div>
    )
}
