'use client'

import { useEffect, useState } from 'react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, Minus, BarChart2, Plus, X, Loader2, Trash2 } from 'lucide-react'

function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}
function pct(a: number, b: number) {
    if (!b) return null
    const v = ((a - b) / b * 100).toFixed(1)
    return parseFloat(v)
}

const CHART_COLORS = ['#7c3aed', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const emptyCusto = { descricao: '', valor: '', categoria: 'Infraestrutura', data: new Date().toISOString().slice(0, 10), recorrente: false }

export default function FinanceiroPage() {
    const [historico, setHistorico] = useState<any[]>([])
    const [resumo, setResumo] = useState<any>(null)
    const [custos, setCustos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCustoModal, setShowCustoModal] = useState(false)
    const [custoForm, setCustoForm] = useState({ ...emptyCusto })
    const [saving, setSaving] = useState(false)
    const [chartType, setChartType] = useState<'barra' | 'linha'>('barra')

    useEffect(() => {
        setLoading(true)
        Promise.all([
            fetch('/api/financeiro').then(r => r.json()).catch(() => null),
            fetch('/api/financeiro/custos').then(r => r.json()).catch(() => []),
            fetch('/api/financeiro/historico').then(r => r.json()).catch(() => []),
        ]).then(([res, c, h]) => {
            setResumo(res)
            setCustos(Array.isArray(c) ? c : [])
            setHistorico(Array.isArray(h) ? h : [])
        }).finally(() => setLoading(false))
    }, [])

    const mesAtual = historico[historico.length - 1]
    const mesAnterior = historico[historico.length - 2]
    const varReceita = mesAtual && mesAnterior ? pct(mesAtual.receita, mesAnterior.receita) : null
    const varCusto = mesAtual && mesAnterior ? pct(mesAtual.custos, mesAnterior.custos) : null
    const varLucro = mesAtual && mesAnterior ? pct(mesAtual.lucro, mesAnterior.lucro) : null

    // Pie data from recent month clients
    const totalCustosByCategory = custos.reduce<Record<string, number>>((acc, c) => {
        acc[c.categoria] = (acc[c.categoria] || 0) + c.valor
        return acc
    }, {})
    const pieData = Object.entries(totalCustosByCategory).map(([name, value]) => ({ name, value }))

    const addCusto = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        await fetch('/api/financeiro/custos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...custoForm, valor: parseFloat(custoForm.valor) })
        })
        setSaving(false); setShowCustoModal(false); setCustoForm({ ...emptyCusto })
        fetch('/api/financeiro/custos').then(r => r.json()).then(d => setCustos(Array.isArray(d) ? d : []))
    }

    const deleteCusto = async (id: string) => {
        if (!confirm('Excluir este custo?')) return
        await fetch(`/api/financeiro/custos/${id}`, { method: 'DELETE' })
        setCustos(c => c.filter(x => x.id !== id))
    }

    const kpis = [
        {
            label: 'Receita Total', value: resumo?.receita_total ?? 0, var: varReceita,
            icon: DollarSign, color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', varGood: 'up',
        },
        {
            label: 'Custos Totais', value: resumo?.custos_totais ?? 0, var: varCusto,
            icon: Minus, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', varGood: 'down',
        },
        {
            label: 'Lucro Líquido', value: resumo?.lucro_liquido ?? 0, var: varLucro,
            icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)', varGood: 'up',
        },
        {
            label: 'Clientes Ativos', value: resumo?.clientes_ativos ?? 0, var: null,
            icon: BarChart2, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', varGood: 'up',
        },
    ]

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
            <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
        </div>
    )

    return (
        <div>
            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Financeiro</h1>
                    <p className="page-subtitle">Análise financeira completa da operação</p>
                </div>
                <button onClick={() => setShowCustoModal(true)} className="btn-primary"><Plus size={16} /> Novo Custo</button>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
                {kpis.map(k => {
                    const isPos = k.var !== null ? k.var >= 0 : null
                    const varGood = k.varGood === 'up' ? isPos : !isPos
                    return (
                        <div key={k.label} className="stat-card">
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <k.icon size={18} style={{ color: k.color }} />
                                </div>
                                {k.var !== null && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: varGood ? '#d1fae5' : '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '999px' }}>
                                        {isPos ? <TrendingUp size={11} style={{ color: varGood ? '#065f46' : '#991b1b' }} /> : <TrendingDown size={11} style={{ color: varGood ? '#065f46' : '#991b1b' }} />}
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: varGood ? '#065f46' : '#991b1b' }}>{k.var > 0 ? '+' : ''}{k.var}%</span>
                                    </div>
                                )}
                            </div>
                            <p style={{ fontSize: k.label === 'Clientes Ativos' ? '2rem' : '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                {k.label === 'Clientes Ativos' ? k.value : formatCurrency(k.value)}
                            </p>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{k.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Charts row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Revenue vs Costs chart */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>Receita × Custos × Lucro</h2>
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                            {(['barra', 'linha'] as const).map(ct => (
                                <button key={ct} onClick={() => setChartType(ct)} style={{
                                    padding: '0.3rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid var(--border)',
                                    background: chartType === ct ? 'var(--color-purple-500)' : 'transparent',
                                    color: chartType === ct ? '#fff' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600,
                                    cursor: 'pointer', fontFamily: 'inherit',
                                }}>
                                    {ct === 'barra' ? 'Barras' : 'Linha'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: '260px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'barra' ? (
                                <BarChart data={historico} barCategoryGap="25%">
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={m => m.substring(5)} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="receita" name="Receita" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="custos" name="Custos" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="lucro" name="Lucro" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            ) : (
                                <LineChart data={historico}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={m => m.substring(5)} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    <Line type="monotone" dataKey="receita" name="Receita" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 4, fill: '#7c3aed' }} />
                                    <Line type="monotone" dataKey="custos" name="Custos" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: '#f59e0b' }} />
                                    <Line type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie chart: costs by category */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '1.25rem' }}>Custos por Categoria</h2>
                    {pieData.length === 0 ? (
                        <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sem dados</p>
                        </div>
                    ) : (
                        <div style={{ height: '200px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" paddingAngle={3}>
                                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    {/* Summary below pie */}
                    <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                        {pieData.slice(0, 3).map((d, i) => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.name}</span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(d.value)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lucro trend */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Evolução do Lucro</h2>
                <div style={{ height: '180px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historico}>
                            <defs>
                                <linearGradient id="lucroGradFin" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={m => m.substring(5)} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }} />
                            <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#10b981" strokeWidth={2.5} fill="url(#lucroGradFin)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Custos table */}
            <div className="card">
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)' }}>Custos Operacionais</h2>
                    <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{custos.length} registros</span>
                </div>
                <div>
                    {custos.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <DollarSign size={32} style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                            <p style={{ fontSize: '0.875rem' }}>Nenhum custo registrado</p>
                        </div>
                    ) : custos.map(c => (
                        <div key={c.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.descricao}</p>
                                    {c.recorrente && <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(124,58,237,0.1)', color: 'var(--color-purple-500)', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>Recorrente</span>}
                                </div>
                                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{c.categoria} · {c.data}</p>
                            </div>
                            <p style={{ fontWeight: 700, color: '#ef4444', flexShrink: 0 }}>{formatCurrency(c.valor)}</p>
                            <button onClick={() => deleteCusto(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', flexShrink: 0 }}>
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal add custo */}
            {showCustoModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCustoModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '480px' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Novo Custo Operacional</h2>
                            <button onClick={() => setShowCustoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={addCusto} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Descrição *</label>
                                <input className="form-input" required value={custoForm.descricao} onChange={e => setCustoForm(f => ({ ...f, descricao: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Valor (R$) *</label>
                                    <input className="form-input" type="number" required step="0.01" value={custoForm.valor} onChange={e => setCustoForm(f => ({ ...f, valor: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="form-label">Data</label>
                                    <input className="form-input" type="date" value={custoForm.data} onChange={e => setCustoForm(f => ({ ...f, data: e.target.value }))} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Categoria</label>
                                <select className="form-input" value={custoForm.categoria} onChange={e => setCustoForm(f => ({ ...f, categoria: e.target.value }))}>
                                    {['Infraestrutura', 'Marketing', 'Pessoal', 'Software', 'Operacional', 'Outros'].map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={custoForm.recorrente} onChange={e => setCustoForm(f => ({ ...f, recorrente: e.target.checked }))} />
                                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Custo recorrente mensal</span>
                            </label>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowCustoModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
