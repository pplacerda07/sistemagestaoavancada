'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { Users, CheckSquare, UsersRound, ArrowUpRight, TrendingUp, TrendingDown, Clock, AlertTriangle, DollarSign } from 'lucide-react'

function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

const PRIORIDADE_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }
const STATUS_LABEL: Record<string, string> = { a_fazer: 'A Fazer', em_andamento: 'Andamento', concluida: 'Concluída' }

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [clientes, setClientes] = useState<any[]>([])
    const [tarefas, setTarefas] = useState<any[]>([])
    const [equipes, setEquipes] = useState<any[]>([])
    const [historico, setHistorico] = useState<any[]>([])

    useEffect(() => {
        Promise.all([
            fetch('/api/auth/me').then(r => r.json()).catch(() => ({})),
            fetch('/api/clientes').then(r => r.json()).catch(() => []),
            fetch('/api/tarefas').then(r => r.json()).catch(() => []),
            fetch('/api/equipes').then(r => r.json()).catch(() => []),
            fetch('/api/financeiro/historico').then(r => r.json()).catch(() => []),
        ]).then(([me, c, t, e, h]) => {
            setUser(me?.user ?? null)
            setClientes(Array.isArray(c) ? c : [])
            setTarefas(Array.isArray(t) ? t : [])
            setEquipes(Array.isArray(e) ? e : [])
            setHistorico(Array.isArray(h) ? h : [])
        })
    }, [])

    const clientesAtivos = clientes.filter(c => c.status === 'ativo')
    const tarefasPendentes = tarefas.filter(t => t.status !== 'concluida')
    const tarefasConcluidas = tarefas.filter(t => t.status === 'concluida')
    const hoje = new Date().toISOString().split('T')[0]
    const tarefasVencidas = tarefasPendentes.filter(t => t.prazo && t.prazo < hoje)

    const mesAtual = historico[historico.length - 1]
    const mesAnterior = historico[historico.length - 2]
    const varReceita = mesAtual && mesAnterior ? ((mesAtual.receita - mesAnterior.receita) / mesAnterior.receita * 100).toFixed(1) : null
    const varLucro = mesAtual && mesAnterior ? ((mesAtual.lucro - mesAnterior.lucro) / mesAnterior.lucro * 100).toFixed(1) : null

    const chartData = historico.map(h => ({
        mes: h.mes.substring(5),
        receita: h.receita,
        lucro: h.lucro,
    }))

    const kpis = [
        {
            label: 'Clientes Ativos', value: clientesAtivos.length, icon: Users,
            href: '/clientes', color: 'var(--color-purple-500)', bgColor: 'rgba(124,58,237,0.1)',
            trend: null, trendLabel: `${clientes.length} total`
        },
        {
            label: 'Tarefas Pendentes', value: tarefasPendentes.length, icon: Clock,
            href: '/tarefas', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)',
            trend: tarefasVencidas.length > 0 ? 'down' : null,
            trendLabel: tarefasVencidas.length > 0 ? `${tarefasVencidas.length} vencida(s)` : 'Em dia'
        },
        {
            label: 'Concluídas', value: tarefasConcluidas.length, icon: CheckSquare,
            href: '/tarefas', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)',
            trend: 'up', trendLabel: 'Este mês'
        },
        {
            label: 'Equipes', value: equipes.length, icon: UsersRound,
            href: '/equipes', color: '#6366f1', bgColor: 'rgba(99,102,241,0.1)',
            trend: null, trendLabel: `${equipes.length} ativa(s)`
        },
    ]

    const tarefasRecentes = [...tarefas].sort((a, b) => b.created_at?.localeCompare(a.created_at ?? '') ?? 0).slice(0, 6)

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Olá{user?.nome ? `, ${user.nome.split(' ')[0]}` : ''} 👋
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    Aqui está uma visão geral do seu negócio hoje.
                </p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {kpis.map(k => (
                    <Link key={k.label} href={k.href} style={{ textDecoration: 'none' }}>
                        <div className="stat-card" style={{ cursor: 'pointer' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: k.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <k.icon size={18} style={{ color: k.color }} />
                                </div>
                                <ArrowUpRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                            </div>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{k.value}</p>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{k.label}</p>
                            <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {k.trend === 'up' && <TrendingUp size={12} style={{ color: '#10b981' }} />}
                                {k.trend === 'down' && <AlertTriangle size={12} style={{ color: '#ef4444' }} />}
                                <span style={{ fontSize: '0.7rem', color: k.trend === 'down' ? '#ef4444' : 'var(--text-muted)', fontWeight: 500 }}>{k.trendLabel}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Revenue chart */}
                {user?.is_admin_matriz && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Receita Mensal</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{mesAtual ? formatCurrency(mesAtual.receita) : '—'}</p>
                            </div>
                            {varReceita && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: parseFloat(varReceita) >= 0 ? '#d1fae5' : '#fee2e2', padding: '0.3rem 0.6rem', borderRadius: '999px' }}>
                                    {parseFloat(varReceita) >= 0 ? <TrendingUp size={13} style={{ color: '#065f46' }} /> : <TrendingDown size={13} style={{ color: '#991b1b' }} />}
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: parseFloat(varReceita) >= 0 ? '#065f46' : '#991b1b' }}>{varReceita}% vs mês ant.</span>
                                </div>
                            )}
                        </div>
                        <div style={{ height: '120px', marginTop: '1rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="receita" stroke="#7c3aed" strokeWidth={2} fill="url(#recGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Lucro card */}
                {user?.is_admin_matriz && (
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Lucro Líquido</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{mesAtual ? formatCurrency(mesAtual.lucro) : '—'}</p>
                            </div>
                            {varLucro && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: parseFloat(varLucro) >= 0 ? '#d1fae5' : '#fee2e2', padding: '0.3rem 0.6rem', borderRadius: '999px' }}>
                                    {parseFloat(varLucro) >= 0 ? <TrendingUp size={13} style={{ color: '#065f46' }} /> : <TrendingDown size={13} style={{ color: '#991b1b' }} />}
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: parseFloat(varLucro) >= 0 ? '#065f46' : '#991b1b' }}>{varLucro}% vs mês ant.</span>
                                </div>
                            )}
                        </div>
                        <div style={{ height: '120px', marginTop: '1rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="lucroGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={2} fill="url(#lucroGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Tarefas recentes */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                <div className="card">
                    <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>Tarefas Recentes</h2>
                        <Link href="/tarefas" style={{ color: 'var(--color-purple-500)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            Ver todas <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <div>
                        {tarefasRecentes.length === 0 ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <CheckSquare size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '0.875rem' }}>Nenhuma tarefa ainda</p>
                            </div>
                        ) : tarefasRecentes.map(t => {
                            const vencida = t.prazo && t.prazo < hoje && t.status !== 'concluida'
                            return (
                                <div key={t.id} style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.titulo}</p>
                                            {vencida && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ef4444', background: '#fee2e2', padding: '0.15rem 0.4rem', borderRadius: '999px', flexShrink: 0 }}>VENCIDA</span>}
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.175rem' }}>
                                            {t.cliente?.nome || 'Sem cliente'}{t.prazo ? ` · ${t.prazo}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                        <span className={`badge badge-${t.prioridade}`}>{PRIORIDADE_LABEL[t.prioridade]}</span>
                                        <span className={`badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick links */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Acesso Rápido</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { href: '/clientes', label: 'Clientes', icon: Users, color: 'var(--color-purple-500)', bg: 'rgba(124,58,237,0.1)' },
                            { href: '/tarefas', label: 'Tarefas', icon: CheckSquare, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                            { href: '/equipes', label: 'Equipes', icon: UsersRound, color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
                            ...(user?.is_admin_matriz ? [
                                { href: '/financeiro', label: 'Financeiro', icon: DollarSign, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                            ] : []),
                        ].map(a => (
                            <Link key={a.href} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.75rem', textDecoration: 'none', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', transition: 'border-color 0.15s' }}>
                                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <a.icon size={16} style={{ color: a.color }} />
                                </div>
                                <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</span>
                                <ArrowUpRight size={13} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
