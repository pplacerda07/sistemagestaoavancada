'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, LayoutTemplate, Loader2, Save, X, ChevronRight, Edit3 } from 'lucide-react'

type Prioridade = 'baixa' | 'media' | 'alta'

interface TemplateTarefa {
    id?: string
    titulo: string
    descricao: string
    prazo_dias: number
    prioridade: Prioridade
}

interface Template {
    id: string
    nome: string
    descricao: string | null
    tarefas: TemplateTarefa[]
    created_at: string
}

const PRIO_LABELS: Record<Prioridade, string> = { baixa: 'Baixa', media: 'Média', alta: 'Alta' }
const PRIO_COLORS: Record<Prioridade, string> = { baixa: '#10b981', media: '#f59e0b', alta: '#ef4444' }

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [form, setForm] = useState({ nome: '', descricao: '', tarefas: [] as TemplateTarefa[] })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        load()
    }, [])

    const load = () => {
        setLoading(true)
        fetch('/api/templates').then(r => r.json()).then(d => setTemplates(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }

    const openCreate = () => {
        setEditing(null)
        setForm({ nome: '', descricao: '', tarefas: [{ titulo: '', descricao: '', prazo_dias: 7, prioridade: 'media' }] })
        setShowModal(true)
    }

    const openEdit = (t: Template) => {
        setEditing(t)
        setForm({
            nome: t.nome,
            descricao: t.descricao || '',
            tarefas: t.tarefas.map(tt => ({ ...tt }))
        })
        setShowModal(true)
    }

    const addTarefa = () => {
        setForm(f => ({
            ...f,
            tarefas: [...f.tarefas, { titulo: '', descricao: '', prazo_dias: 7, prioridade: 'media' }]
        }))
    }

    const removeTarefa = (idx: number) => {
        setForm(f => ({
            ...f,
            tarefas: f.tarefas.filter((_, i) => i !== idx)
        }))
    }

    const updateTarefa = (idx: number, patch: Partial<TemplateTarefa>) => {
        setForm(f => ({
            ...f,
            tarefas: f.tarefas.map((t, i) => i === idx ? { ...t, ...patch } : t)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const url = editing ? `/api/templates/${editing.id}` : '/api/templates'
        const method = editing ? 'PUT' : 'POST'
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        setSaving(false)
        setShowModal(false)
        load()
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja excluir este template? Todas as definições de tarefas serão perdidas.')) return
        await fetch(`/api/templates/${id}`, { method: 'DELETE' })
        load()
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Templates de Tarefas</h1>
                    <p className="page-subtitle">Conjuntos de tarefas padrão para novos clientes</p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <Plus size={16} /> Novo Template
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
                </div>
            ) : templates.length === 0 ? (
                <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <LayoutTemplate size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>Nenhum template criado ainda.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                    {templates.map(t => (
                        <div key={t.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.nome}</h3>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.descricao}</p>
                                </div>
                                <LayoutTemplate size={20} style={{ color: 'var(--color-purple-500)', opacity: 0.5, flexShrink: 0 }} />
                            </div>

                            <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-purple-500)' }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.tarefas.length} Tarefas Definidas</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {t.tarefas.slice(0, 3).map((tt, i) => (
                                        <p key={i} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            • {tt.titulo}
                                        </p>
                                    ))}
                                    {t.tarefas.length > 3 && <p style={{ fontSize: '0.7rem', color: 'var(--color-purple-500)', fontWeight: 600 }}>+ {t.tarefas.length - 3} mais...</p>}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <button onClick={() => openEdit(t)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.8rem' }}>
                                    <Edit3 size={14} /> Editar
                                </button>
                                <button onClick={() => handleDelete(t.id)} className="btn-ghost" style={{ color: '#ef4444', padding: '0.5rem' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Template */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content" style={{ maxWidth: '720px', width: '90%' }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>{editing ? 'Editar Template' : 'Novo Template'}</h2>
                            <button onClick={() => setShowModal(false)} className="btn-ghost" style={{ padding: '0.5rem' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ maxHeight: '80vh', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Header info */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                <div>
                                    <label className="form-label">Nome do Template *</label>
                                    <input required className="form-input" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Onboarding Social Media" />
                                </div>
                                <div>
                                    <label className="form-label">Descrição</label>
                                    <textarea className="form-input" rows={2} style={{ resize: 'none' }} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Breve resumo deste conjunto de tarefas" />
                                </div>
                            </div>

                            {/* Task List Builder */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>Tarefas do Template</h3>
                                    <button type="button" onClick={addTarefa} className="btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}>
                                        <Plus size={14} /> Adicionar Tarefa
                                    </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {form.tarefas.map((tt, i) => (
                                        <div key={i} style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid var(--border)', position: 'relative' }}>
                                            <button type="button" onClick={() => removeTarefa(i)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                                <X size={16} />
                                            </button>

                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                                <div style={{ gridColumn: '1 / span 3' }}>
                                                    <label className="form-label">Título da Tarefa *</label>
                                                    <input required className="form-input" value={tt.titulo} onChange={e => updateTarefa(i, { titulo: e.target.value })} />
                                                </div>
                                                <div style={{ gridColumn: '1 / span 3' }}>
                                                    <label className="form-label">Descrição</label>
                                                    <textarea className="form-input" rows={2} style={{ resize: 'none' }} value={tt.descricao} onChange={e => updateTarefa(i, { descricao: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="form-label">Prioridade</label>
                                                    <select className="form-input" value={tt.prioridade} onChange={e => updateTarefa(i, { prioridade: e.target.value as Prioridade })}>
                                                        <option value="baixa">Baixa</option>
                                                        <option value="media">Média</option>
                                                        <option value="alta">Alta</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="form-label">Prazo (Dias)</label>
                                                    <input type="number" required className="form-input" value={tt.prazo_dias} onChange={e => updateTarefa(i, { prazo_dias: parseInt(e.target.value) })} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {form.tarefas.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.75rem', color: 'var(--text-muted)' }}>
                                            Nenhuma tarefa adicionada. Clique em "Adicionar Tarefa".
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancelar</button>
                                <button type="submit" disabled={saving || form.tarefas.length === 0} className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    {saving ? 'Gravando...' : 'Salvar Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
