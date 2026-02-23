'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
    LayoutDashboard, Users, CheckSquare, UsersRound,
    DollarSign, UserCog, LogOut, Sun, Moon, Zap, Bell,
    LayoutTemplate, Lightbulb, Sparkles
} from 'lucide-react'

interface SidebarProps {
    user: { nome: string; funcao: string; is_admin_matriz: boolean }
    onLogout: () => void
    theme: 'light' | 'dark'
    onToggleTheme: () => void
}

const navItems = [
    { href: '/foco', label: 'Modo Foco', icon: LayoutDashboard, adminOnly: true },
    { href: '/dashboard', label: 'Dashboard Resumo', icon: LayoutDashboard, adminOnly: false },
    { href: '/resumo', label: 'Resumo Semanal', icon: Sparkles, adminOnly: true },
    { href: '/clientes', label: 'Clientes', icon: Users, adminOnly: false },
    { href: '/tarefas', label: 'Tarefas', icon: CheckSquare, adminOnly: false },
    { href: '/ideias', label: 'Inbox', icon: Lightbulb, adminOnly: false },
    { href: '/templates', label: 'Templates', icon: LayoutTemplate, adminOnly: false },
    { href: '/equipes', label: 'Equipes', icon: UsersRound, adminOnly: false },
    { href: '/financeiro', label: 'Financeiro', icon: DollarSign, adminOnly: true },
    { href: '/usuarios', label: 'Usuários', icon: UserCog, adminOnly: true },
]

export default function Sidebar({ user, onLogout, theme, onToggleTheme }: SidebarProps) {
    const pathname = usePathname()
    const initial = user.nome?.charAt(0)?.toUpperCase() || '?'
    const [alertCount, setAlertCount] = useState(0)

    useEffect(() => {
        const load = () =>
            fetch('/api/alertas')
                .then(r => r.json())
                .then(d => setAlertCount(Array.isArray(d) ? d.length : 0))
                .catch(() => { })
        load()
        const interval = setInterval(load, 60_000) // refresh every minute
        return () => clearInterval(interval)
    }, [])

    return (
        <aside style={{
            width: '240px', minHeight: '100vh', display: 'flex', flexDirection: 'column',
            background: 'var(--sidebar-bg)', flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            transition: 'background 0.3s ease',
        }}>
            {/* Logo */}
            <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(124,58,237,0.4)',
                    }}>
                        <Zap size={16} color="white" fill="white" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>Fiora Agency</p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.2 }}>CRM Gestão</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {navItems.map(item => {
                    if (item.adminOnly && !user.is_admin_matriz) return null
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link key={item.href} href={item.href} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.825rem', fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                            background: isActive ? 'var(--sidebar-active)' : 'transparent',
                            textDecoration: 'none', transition: 'all 0.15s',
                            borderLeft: isActive ? '2px solid var(--color-purple-400)' : '2px solid transparent',
                        }}>
                            <item.icon size={17} style={{ opacity: isActive ? 1 : 0.6 }} />
                            {item.label}
                        </Link>
                    )
                })}

                {/* Alertas — always visible */}
                {(() => {
                    const isActive = pathname.startsWith('/alertas')
                    return (
                        <Link href="/alertas" style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.625rem 0.875rem',
                            borderRadius: '0.625rem',
                            fontSize: '0.825rem', fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                            background: isActive ? 'var(--sidebar-active)' : 'transparent',
                            textDecoration: 'none', transition: 'all 0.15s',
                            borderLeft: isActive ? '2px solid var(--color-purple-400)' : '2px solid transparent',
                        }}>
                            <div style={{ position: 'relative', display: 'flex' }}>
                                <Bell size={17} style={{ opacity: isActive ? 1 : 0.6 }} />
                                {alertCount > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '-5px', right: '-7px',
                                        background: '#ef4444', color: '#fff',
                                        fontSize: '0.55rem', fontWeight: 800,
                                        minWidth: '14px', height: '14px',
                                        borderRadius: '99px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        padding: '0 3px', lineHeight: 1,
                                    }}>
                                        {alertCount > 99 ? '99+' : alertCount}
                                    </span>
                                )}
                            </div>
                            Alertas
                            {alertCount > 0 && (
                                <span style={{
                                    marginLeft: 'auto', background: '#ef4444',
                                    color: '#fff', fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.1rem 0.4rem', borderRadius: '99px',
                                }}>
                                    {alertCount}
                                </span>
                            )}
                        </Link>
                    )
                })()}
            </nav>

            {/* Footer */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <button onClick={onToggleTheme} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.625rem 0.875rem',
                    borderRadius: '0.625rem', border: 'none', background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 500,
                    cursor: 'pointer', marginBottom: '0.25rem', transition: 'background 0.15s',
                }}>
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                </button>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.625rem 0.875rem', marginBottom: '0.25rem',
                }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: '#fff',
                    }}>{initial}</div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.775rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nome}</p>
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)' }}>{user.is_admin_matriz ? 'Admin Matriz' : user.funcao}</p>
                    </div>
                </div>

                <button onClick={onLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.625rem 0.875rem',
                    borderRadius: '0.625rem', border: 'none', background: 'transparent',
                    color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                }}>
                    <LogOut size={16} />
                    Sair
                </button>
            </div>
        </aside>
    )
}
