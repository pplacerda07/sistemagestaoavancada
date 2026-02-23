import { useState, useEffect } from 'react'
import { Loader2, CheckSquare, AlertCircle, CalendarClock, Zap } from 'lucide-react'

// Mapped from DBTarefa standard
export interface PriorityTask {
    id: string; titulo: string; descricao: string | null; cliente_id: string | null; cliente_nome?: string;
    status: 'a_fazer' | 'em_andamento' | 'concluida';
    prioridade: 'baixa' | 'media' | 'alta'; prazo: string | null;
    motivo_prioridade?: string; class_urgente?: boolean;
}

export function SmartTaskQueue() {
    const [tasks, setTasks] = useState<PriorityTask[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch all open tasks
                const resT = await fetch('/api/tarefas')
                let allTasks = await resT.json()
                allTasks = allTasks.filter((t: any) => t.status !== 'concluida')

                // Fetch clients to check health score
                const resC = await fetch('/api/clientes')
                const allClients = await resC.json()

                // Calculate health scores (simulated batch via local logic or fetching individually)
                // For performance, doing a quick proxy: normally we'd hit /health, here we mock it by mapping to existing client status if API doesn't support batch.
                // Assuming we can map health locally if we only have clients. We will fetch real health below if needed.
                const healthMap: Record<string, string> = {}
                for (const c of allClients) {
                    try {
                        const hRes = await fetch(`/api/clientes/${c.id}/health`)
                        const hData = await hRes.json()
                        healthMap[c.id] = hData.level // verde, amarelo, vermelho
                    } catch { healthMap[c.id] = 'verde' }
                }

                // Sorting Logic
                const todayStr = new Date().toISOString().split('T')[0]
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                const tomorrowStr = tomorrow.toISOString().split('T')[0]

                const processed: PriorityTask[] = allTasks.map((t: any) => {
                    const clientName = allClients.find((c: any) => c.id === t.cliente_id)?.nome || 'Sem Cliente'
                    const healthLevel = healthMap[t.cliente_id!] || 'verde'

                    let priorityScore = 0
                    let motivo = ''
                    let urgente = false

                    // 1. Cliente Crítico (Health Score Vermelho) -> OBRIGATÓRIO SUBIR
                    if (healthLevel === 'vermelho') {
                        priorityScore = 1000
                        motivo = 'Cliente Crítico'
                        urgente = true
                    }
                    // 2. Atrasada ou Vence Hoje
                    else if (t.prazo && t.prazo <= todayStr) {
                        priorityScore = 500
                        motivo = t.prazo < todayStr ? 'Atrasada' : 'Vence Hoje'
                        urgente = true
                    }
                    // 3. Prioridade Alta
                    else if (t.prioridade === 'alta') {
                        priorityScore = 300
                        motivo = 'Urgência Definida'
                    }
                    // 4. Vence Amanhã
                    else if (t.prazo === tomorrowStr) {
                        priorityScore = 150
                        motivo = 'Vence Amanhã'
                    }
                    // 5. Normal
                    else {
                        priorityScore = t.prioridade === 'media' ? 50 : 10
                        motivo = 'Fila Normal'
                    }

                    return {
                        ...t,
                        cliente_nome: clientName,
                        score_ordenacao: priorityScore, // internal use
                        motivo_prioridade: motivo,
                        class_urgente: urgente
                    }
                })

                // Sort by calculated score descending
                processed.sort((a: any, b: any) => b.score_ordenacao - a.score_ordenacao)

                setTasks(processed)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}><Loader2 className="animate-spin text-purple-500" /></div>

    if (tasks.length === 0) return (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
            <CheckSquare size={32} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
            <p style={{ color: 'var(--text-muted)' }}>Você não possui tarefas pendentes.</p>
        </div>
    )

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Zap size={16} style={{ color: 'var(--color-purple-500)' }} />
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Por Onde Começar</h3>
            </div>

            {tasks.map((t, idx) => (
                <div key={t.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '1rem',
                    padding: '1rem', background: 'var(--bg-secondary)',
                    borderRadius: '0.75rem', border: '1px solid var(--border)',
                    borderLeft: t.class_urgente ? '3px solid #ef4444' : '3px solid transparent'
                }}>
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700
                    }}>
                        {idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.titulo}</p>
                            {t.class_urgente && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.4rem', borderRadius: '99px', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                    <AlertCircle size={10} /> {t.motivo_prioridade}
                                </span>
                            )}
                            {!t.class_urgente && t.motivo_prioridade !== 'Fila Normal' && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.4rem', borderRadius: '99px', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                                    {t.motivo_prioridade}
                                </span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.cliente_nome}</p>
                    </div>

                    {t.prazo && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <CalendarClock size={14} />
                            {new Date(t.prazo).toLocaleDateString('pt-BR')}
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
