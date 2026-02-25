'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Loader2, CheckSquare, AlertTriangle, Clock, RefreshCw } from 'lucide-react'

type StatusTarefa = 'a_fazer' | 'em_andamento' | 'concluida'
type Prioridade = 'alta' | 'media' | 'baixa'

const COLUMNS: { id: StatusTarefa; label: string; color: string }[] = [
    { id: 'a_fazer', label: 'A Fazer', color: '#6366f1' },
    { id: 'em_andamento', label: 'Em Andamento', color: '#f59e0b' },
    { id: 'concluida', label: 'Concluída', color: '#10b981' },
]

const PRIO_COLORS: Record<Prioridade, string> = { alta: '#ef4444', media: '#f59e0b', baixa: '#10b981' }
const PRIO_BG: Record<Prioridade, string> = { alta: '#fee2e2', media: '#fef3c7', baixa: '#d1fae5' }
const PRIO_LABEL: Record<Prioridade, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

const emptyForm = { titulo: '', descricao: '', prioridade: 'media' as Prioridade, prazo: '', cliente_id: '', status: 'a_fazer' as StatusTarefa, recorrencia: 'nenhuma', visivel_portal: false }

export default function TarefasPage() {
    const [tarefas, setTarefas] = useState<any[]>([])
    const [clientes, setClientes] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [draggedId, setDraggedId] = useState<string | null>(null)
    const [form, setForm] = useState({ ...emptyForm })
    const [saving, setSaving] = useState(false)
    const [filterPrio, setFilterPrio] = useState<string>('all')

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
        load()
        fetch('/api/clientes').then(r => r.json()).then(d => setClientes(Array.isArray(d) ? d : []))
    }, [])

    const load = () => {
        setLoading(true)
        fetch('/api/tarefas').then(r => r.json()).then(d => setTarefas(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }

    const openCreate = (status: StatusTarefa = 'a_fazer') => {
        setEditing(null)
        setForm({ ...emptyForm, status })
        setShowModal(true)
    }
    const openEdit = (t: any) => {
        setEditing(t)
        setForm({ titulo: t.titulo, descricao: t.descricao || '', prioridade: t.prioridade, prazo: t.prazo || '', cliente_id: t.cliente_id || '', status: t.status, recorrencia: t.recorrencia || 'nenhuma', visivel_portal: t.visivel_portal || false })
        setShowModal(true)
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        const url = editing ? `/api/tarefas/${editing.id}` : '/api/tarefas'
        const method = editing ? 'PUT' : 'POST'
        await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        setSaving(false); setShowModal(false); load()
    }
    const handleDelete = async (id: string) => {
        if (!confirm('Excluir esta tarefa?')) return
        await fetch(`/api/tarefas/${id}`, { method: 'DELETE' })
        load()
    }

    const moveStatus = async (id: string, status: StatusTarefa) => {
        await fetch(`/api/tarefas/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
        setTarefas(ts => ts.map(t => t.id === id ? { ...t, status } : t))
    }

    const hoje = new Date().toISOString().split('T')[0]

    const filtered = tarefas.filter(t => filterPrio === 'all' || t.prioridade === filterPrio)
    const byStatus = (status: StatusTarefa) => filtered.filter(t => t.status === status)

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id)
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text/plain', id)
    }
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }
    const handleDrop = (e: React.DragEvent, status: StatusTarefa) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData('text/plain') || draggedId
        if (taskId && taskId !== status) {
            moveStatus(taskId, status)
        }
        setDraggedId(null)
    }

    const stats = {
        total: tarefas.length,
        alta: tarefas.filter(t => t.prioridade === 'alta' && t.status !== 'concluida').length,
        vencidas: tarefas.filter(t => t.prazo && t.prazo < hoje && t.status !== 'concluida').length,
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Tarefas</h1>
                    <p className="page-subtitle">{stats.total} tarefas{stats.alta > 0 ? ` · ${stats.alta} alta prioridade` : ''}{stats.vencidas > 0 ? ` · ${stats.vencidas} vencida(s)` : ''}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {/* Filtro prioridade */}
                    <div style={{ display: 'flex', gap: '0.375rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '0.25rem', borderRadius: '0.625rem' }}>
                        {['all', 'alta', 'media', 'baixa'].map(p => (
                            <button key={p} onClick={() => setFilterPrio(p)} style={{
                                padding: '0.3rem 0.75rem', borderRadius: '0.4rem', border: 'none',
                                background: filterPrio === p ? 'var(--color-purple-500)' : 'transparent',
                                color: filterPrio === p ? '#fff' : 'var(--text-muted)',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all 0.15s',
                            }}>
                                {p === 'all' ? 'Todas' : PRIO_LABEL[p as Prioridade]}
                            </button>
                        ))}
                    </div>
                    {(user?.is_admin_matriz || user?.funcao) && (
                        <button onClick={() => openCreate()} className="btn-primary"><Plus size={16} /> Nova Tarefa</button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
                    {COLUMNS.map(col => {
                        const items = byStatus(col.id)
                        return (
                            <div
                                key={col.id}
                                onDragOver={handleDragOver}
                                onDrop={e => handleDrop(e, col.id)}
                                style={{
                                    background: 'var(--bg-secondary)', borderRadius: '1rem',
                                    border: '1px solid var(--border)', overflow: 'hidden',
                                    minHeight: '520px', display: 'flex', flexDirection: 'column',
                                }}
                            >
                                {/* Column header */}
                                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.color }} />
                                        <span style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>{col.label}</span>
                                        <div style={{ minWidth: '22px', height: '22px', borderRadius: '999px', background: col.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: col.color }}>{items.length}</span>
                                        </div>
                                    </div>
                                    {(user?.is_admin_matriz || user?.funcao) && (
                                        <button onClick={() => openCreate(col.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.15rem' }}>
                                            <Plus size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Cards */}
                                <div style={{ flex: 1, padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {items.length === 0 && (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.4 }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <CheckSquare size={28} style={{ margin: '0 auto 0.5rem' }} />
                                                <p style={{ fontSize: '0.75rem' }}>Arraste ou adicione</p>
                                            </div>
                                        </div>
                                    )}
                                    {items.map(t => {
                                        const vencida = t.prazo && t.prazo < hoje && t.status !== 'concluida'
                                        const clienteNome = clientes.find(c => c.id === t.cliente_id)?.nome
                                        return (
                                            <div
                                                key={t.id}
                                                draggable
                                                onDragStart={e => handleDragStart(e, t.id)}
                                                onClick={() => openEdit(t)}
                                                style={{
                                                    background: 'var(--bg-primary)', borderRadius: '0.75rem',
                                                    border: `1px solid var(--border)`,
                                                    borderLeft: `3px solid ${PRIO_COLORS[t.prioridade as Prioridade]}`,
                                                    padding: '0.875rem 1rem',
                                                    cursor: 'grab', transition: 'all 0.15s',
                                                    opacity: draggedId === t.id ? 0.4 : 1,
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                                        <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4 }}>{t.titulo}</p>
                                                        {t.recorrencia && t.recorrencia !== 'nenhuma' && (
                                                            <RefreshCw size={12} style={{ color: 'var(--color-purple-500)', flexShrink: 0 }} />
                                                        )}
                                                    </div>
                                                    {vencida && <AlertTriangle size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px', marginLeft: '4px' }} />}
                                                </div>

                                                {t.descricao && (
                                                    <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.625rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.descricao}</p>
                                                )}

                                                {clienteNome && (
                                                    <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.4rem', padding: '0.25rem 0.5rem', marginBottom: '0.5rem', display: 'inline-block' }}>
                                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{clienteNome}</p>
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: PRIO_COLORS[t.prioridade as Prioridade], background: PRIO_BG[t.prioridade as Prioridade], padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                                                        {PRIO_LABEL[t.prioridade as Prioridade]}
                                                    </span>
                                                    {t.prazo && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Clock size={11} style={{ color: vencida ? '#ef4444' : 'var(--text-muted)' }} />
                                                            <span style={{ fontSize: '0.7rem', color: vencida ? '#ef4444' : 'var(--text-muted)', fontWeight: 500 }}>{t.prazo}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal create/edit */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '520px' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{editing ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label className="form-label">Título *</label>
                                <input className="form-input" required value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">Descrição</label>
                                <textarea className="form-input" style={{ resize: 'none', fontFamily: 'inherit' }} rows={3} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Prioridade</label>
                                    <select className="form-input" value={form.prioridade} onChange={e => setForm(f => ({ ...f, prioridade: e.target.value as Prioridade }))}>
                                        <option value="alta">Alta</option>
                                        <option value="media">Média</option>
                                        <option value="baixa">Baixa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Status</label>
                                    <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StatusTarefa }))}>
                                        <option value="a_fazer">A Fazer</option>
                                        <option value="em_andamento">Em Andamento</option>
                                        <option value="concluida">Concluída</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Prazo</label>
                                    <input className="form-input" type="date" value={form.prazo} onChange={e => setForm(f => ({ ...f, prazo: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="form-label">Cliente</label>
                                    <select className="form-input" value={form.cliente_id} onChange={e => setForm(f => ({ ...f, cliente_id: e.target.value }))}>
                                        <option value="">Sem cliente</option>
                                        {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Recorrência</label>
                                    <select className="form-input" value={form.recorrencia} onChange={e => setForm(f => ({ ...f, recorrencia: e.target.value }))}>
                                        <option value="nenhuma">Nenhuma</option>
                                        <option value="semanal">Semanal</option>
                                        <option value="quinzenal">Quinzenal</option>
                                        <option value="mensal">Mensal</option>
                                    </select>
                                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                        Tarefas recorrentes se recriam automaticamente ao serem marcadas como concluídas.
                                    </p>
                                </div>
                                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.625rem', marginTop: '0.5rem' }}>
                                    <input type="checkbox" id="visivel_portal" checked={form.visivel_portal} onChange={e => setForm(f => ({ ...f, visivel_portal: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: 'var(--color-purple-500)' }} />
                                    <label htmlFor="visivel_portal" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 500 }}>
                                        Visível no Portal do Cliente
                                    </label>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.25rem' }}>
                                {editing && (
                                    <button type="button" onClick={() => { handleDelete(editing.id); setShowModal(false) }} className="btn-secondary" style={{ color: '#ef4444' }}>
                                        Excluir
                                    </button>
                                )}
                                <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="submit" className="btn-primary" disabled={saving}>
                                        {saving && <Loader2 size={14} className="animate-spin" />}
                                        {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
