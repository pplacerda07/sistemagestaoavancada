'use client'

import { useState, useEffect } from 'react'
import { CalendarRange, CheckCircle2, Clock, Activity, Loader2 } from 'lucide-react'

export default function ResumoSemanal() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                // Determine date range (past 7 days)
                const end = new Date()
                const start = new Date()
                start.setDate(end.getDate() - 7)

                // 1. Fetch Tasks to find completed ones
                // In a real app we'd track "completion_date", here we use 'concluida' status as a proxy 
                // and pretend they were completed this week for demonstration.
                const resT = await fetch('/api/tarefas')
                const allTasks = await resT.json()
                const completedThisWeek = allTasks.filter((t: any) => t.status === 'concluida')

                // 2. Fetch Clients & Hours
                const resC = await fetch('/api/clientes')
                const allClients = await resC.json()

                let totalHours = 0
                const clientHours: Record<string, { nome: string; horas: number }> = {}

                for (const c of allClients) {
                    const hRes = await fetch(`/api/clientes/${c.id}/horas`)
                    const hData = await hRes.json()

                    const clientSum = hData
                        .filter((h: any) => new Date(h.data) >= start && new Date(h.data) <= end)
                        .reduce((acc: number, curr: any) => acc + (Number(curr.horas) || 0), 0)

                    if (clientSum > 0) {
                        clientHours[c.id] = { nome: c.nome, horas: clientSum }
                        totalHours += clientSum
                    }
                }

                // 3. User Capacity
                const userRes = await fetch('/api/auth/me')
                const userData = await userRes.json()
                const capacity = userData.user?.capacidade_semanal_horas || 40

                setData({
                    period: `${start.toLocaleDateString('pt-BR')} - ${end.toLocaleDateString('pt-BR')}`,
                    completedTasks: completedThisWeek,
                    clientHours: Object.values(clientHours).sort((a, b) => b.horas - a.horas),
                    totalHours,
                    capacity
                })
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading || !data) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <Loader2 className="animate-spin text-purple-500" size={32} />
        </div>
    )

    const pctCapacity = Math.min(100, (data.totalHours / data.capacity) * 100)
    const isOver = data.totalHours > data.capacity

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div className="page-header" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CalendarRange size={24} style={{ color: 'var(--color-purple-500)' }} /> Resumo Semanal
                    </h1>
                    <p className="page-subtitle">Sua performance de {data.period}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) 1fr', gap: '1.5rem', alignItems: 'start' }}>

                {/* Left Column: Flow of accomplished items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <section style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                            <div style={{ background: '#10b98115', color: '#10b981', padding: '0.5rem', borderRadius: '0.5rem' }}><CheckCircle2 size={20} /></div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Entregas Realizadas</h2>
                        </div>

                        {data.completedTasks.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma tarefa marcada como concluída neste período.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {data.completedTasks.map((t: any) => (
                                    <li key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ marginTop: '0.15rem' }}><CheckCircle2 size={16} style={{ color: '#10b981' }} /></div>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.titulo}</p>
                                            {t.prazo && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Prazo original: {new Date(t.prazo).toLocaleDateString('pt-BR')}</p>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Right Column: Capacity & Time blocks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <section style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'rgba(124,58,237,0.1)', color: 'var(--color-purple-500)', padding: '0.5rem', borderRadius: '0.5rem' }}><Activity size={20} /></div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Capacidade Física</h2>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isOver ? '#ef4444' : 'var(--text-primary)' }}>{data.totalHours.toFixed(1)}h</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>de {data.capacity}h</span>
                        </div>

                        <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '99px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ height: '100%', width: `${pctCapacity}%`, background: isOver ? '#ef4444' : 'var(--color-purple-500)', borderRadius: '99px' }} />
                        </div>

                        {isOver ? (
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>⚠️ Você excedeu sua capacidade planejada esta semana.</p>
                        ) : (
                            <p style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>✓ Carga de trabalho saudável.</p>
                        )}
                    </section>

                    <section style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ background: '#f59e0b15', color: '#f59e0b', padding: '0.5rem', borderRadius: '0.5rem' }}><Clock size={20} /></div>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Distribuição de Tempo</h2>
                        </div>

                        {data.clientHours.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhuma hora registrada.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {data.clientHours.map((c: any, i: number) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>{c.nome}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{c.horas.toFixed(1)}h</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </div>
        </div>
    )
}
