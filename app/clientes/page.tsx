'use client'

import { useEffect, useState, useRef } from 'react'
import {
    Plus, Search, Pencil, Trash2, X, Loader2, Building2,
    Phone, Mail, Calendar, FileText, Key, Paperclip, CheckSquare,
    Eye, EyeOff, Upload, Tag, ChevronRight, Clock, History,
    FilePlus2, FileX2, StickyNote, UserCheck, AlertCircle, FileEdit,
    TrendingUp, TrendingDown, LayoutTemplate, Sparkles
} from 'lucide-react'

type StatusCliente = 'ativo' | 'pausado' | 'encerrado'
type TipoContrato = 'fixo' | 'freelance'
type TabId = 'info' | 'anotacoes' | 'senhas' | 'arquivos' | 'tarefas' | 'historico' | 'horas'

const STATUS_LABEL: Record<StatusCliente, string> = { ativo: 'Ativo', pausado: 'Pausado', encerrado: 'Encerrado' }
const STATUS_COLORS: Record<StatusCliente, string> = { ativo: '#065f46', pausado: '#92400e', encerrado: '#991b1b' }
const STATUS_BG: Record<StatusCliente, string> = { ativo: '#d1fae5', pausado: '#fef3c7', encerrado: '#fee2e2' }

function formatCurrency(v: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1048576).toFixed(1)} MB`
}
function timeAgo(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`
    return new Date(iso).toLocaleDateString('pt-BR')
}

const SERVICE_COLORS: Record<string, string> = {
    'Gestão de Redes Sociais': '#7c3aed',
    'Criação de Conteúdo': '#2563eb',
    'Desenvolvimento Web': '#059669',
    'Tráfego Pago': '#d97706',
    'Design': '#db2777',
    'Consultoria': '#6366f1',
}

const emptyForm = { nome: '', email: '', telefone: '', servico: '', valor_mensal: '', tipo_contrato: 'fixo' as TipoContrato, data_inicio: '', status: 'ativo' as StatusCliente, observacoes: '', horas_semanais_planejadas: '' as number | '' }

// ── Drawer Tabs ──────────────────────────────────────────
const HEALTH_COLOR: Record<string, string> = { verde: '#10b981', amarelo: '#f59e0b', vermelho: '#ef4444' }
const HEALTH_BG: Record<string, string> = { verde: '#d1fae5', amarelo: '#fef3c7', vermelho: '#fee2e2' }
const HEALTH_LABEL: Record<string, string> = { verde: 'Saudável', amarelo: 'Atenção', vermelho: 'Crítico' }

function DrawerInfo({ cliente, user, onEdit, onUpdate }: any) {
    const [health, setHealth] = useState<any>(null)
    const [rent, setRent] = useState<any>(null)
    const [horasSemanais, setHorasSemanais] = useState<number>(0)

    useEffect(() => {
        fetch(`/api/clientes/${cliente.id}/health`).then(r => r.json()).then(d => setHealth(d)).catch(() => { })

        // Calculate hours logged this week
        fetch(`/api/clientes/${cliente.id}/horas`).then(r => r.json()).then(d => {
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);

            const hoursThisWeek = (Array.isArray(d) ? d : [])
                .filter((h: any) => new Date(h.data) >= startOfWeek)
                .reduce((acc: number, curr: any) => acc + (Number(curr.horas) || 0), 0)

            setHorasSemanais(hoursThisWeek)
        }).catch(() => { })

        if (user?.is_admin_matriz) {
            fetch(`/api/clientes/${cliente.id}/rentabilidade`).then(r => r.json()).then(d => setRent(d)).catch(() => { })
        }
    }, [cliente.id, user])

    const hColor = health ? HEALTH_COLOR[health.level] : 'var(--border)'
    const hBg = health ? HEALTH_BG[health.level] : 'var(--bg-tertiary)'

    return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Health Card */}
            {health && (
                <div style={{ borderRadius: '0.75rem', border: `1px solid ${hColor}40`, overflow: 'hidden' }}>
                    <div style={{ background: hColor, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Health Score — {HEALTH_LABEL[health.level]}
                            </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff' }}>{health.score}/100</span>
                    </div>
                    <div style={{ background: hBg, padding: '0.75rem 1rem' }}>
                        {/* Score bar */}
                        <div style={{ height: '4px', background: 'rgba(0,0,0,0.1)', borderRadius: '99px', marginBottom: '0.625rem' }}>
                            <div style={{ height: '100%', width: `${health.score}%`, background: hColor, borderRadius: '99px', transition: 'width 0.5s ease' }} />
                        </div>
                        {health.reasons.length === 0
                            ? <p style={{ fontSize: '0.8rem', color: hColor, fontWeight: 600 }}>✓ Nenhum problema identificado</p>
                            : <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                {health.reasons.map((r: string, i: number) => (
                                    <li key={i} style={{ fontSize: '0.8rem', color: HEALTH_COLOR[health.level], fontWeight: 500, marginBottom: '0.2rem' }}>
                                        {r}
                                    </li>
                                ))}
                            </ul>
                        }
                    </div>
                </div>
            )}

            {/* Time Block Card */}
            {cliente.horas_semanais_planejadas > 0 && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem 1rem', background: horasSemanais > cliente.horas_semanais_planejadas ? '#ef444418' : '#10b98118', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Bloco de Tempo Semanal</span>
                        {horasSemanais > cliente.horas_semanais_planejadas ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px', background: '#fee2e2', color: '#991b1b' }}>Estourou Limite</span>
                        ) : (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px', background: '#d1fae5', color: '#065f46' }}>No Prazo</span>
                        )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{horasSemanais.toFixed(1)}h utilizadas</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>{cliente.horas_semanais_planejadas}h planejadas</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                width: `${Math.min(100, (horasSemanais / cliente.horas_semanais_planejadas) * 100)}%`,
                                background: horasSemanais > cliente.horas_semanais_planejadas ? '#ef4444' : '#10b981',
                                transition: 'width 0.5s ease',
                                borderRadius: '99px'
                            }} />
                        </div>
                    </div>
                </div>
            )}

            {/* Rentabilidade Card (admin only) */}
            {user?.is_admin_matriz && rent && rent.valorContrato > 0 && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem 1rem', background: rent.lucrativo ? '#10b98118' : '#ef444418', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Rentabilidade — {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '99px', background: rent.lucrativo ? '#d1fae5' : '#fee2e2', color: rent.lucrativo ? '#065f46' : '#991b1b' }}>
                            {rent.lucrativo ? '✓ Lucrativo' : '✗ Prejuízo'}
                        </span>
                    </div>
                    <div style={{ padding: '0.875rem 1rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                        {[
                            { label: 'Contrato', value: formatCurrency(rent.valorContrato) },
                            { label: `Custo (${rent.horasMes}h × R$${rent.valorHora})`, value: formatCurrency(rent.custoMes) },
                            { label: 'Margem', value: formatCurrency(rent.margemMes), color: rent.lucrativo ? '#10b981' : '#ef4444' },
                        ].map(item => (
                            <div key={item.label}>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{item.label}</p>
                                <p style={{ fontSize: '0.95rem', fontWeight: 800, color: item.color || 'var(--text-primary)', marginTop: '0.2rem' }}>{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Header card */}
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className={`badge badge-${cliente.status}`}>{STATUS_LABEL[cliente.status as StatusCliente]}</span>
                    <span className={`badge badge-${cliente.tipo_contrato}`}>{cliente.tipo_contrato === 'fixo' ? 'Contrato Fixo' : 'Freelance'}</span>
                </div>
                {user?.is_admin_matriz && cliente.valor_mensal && (
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-purple-500)' }}>{formatCurrency(cliente.valor_mensal)}<span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mês</span></p>
                )}
            </div>

            {/* Portal Card (admin only) */}
            {user?.is_admin_matriz && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <LayoutTemplate size={16} style={{ color: 'var(--color-purple-500)' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Portal do Cliente</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cliente.portal_ativo ? 'Ativo' : 'Inativo'}</span>
                            <input type="checkbox" checked={cliente.portal_ativo || false} onChange={async (e) => {
                                const ativo = e.target.checked;
                                const res = await fetch(`/api/clientes/${cliente.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ portal_ativo: ativo })
                                });
                                const data = await res.json();
                                if (onUpdate) onUpdate(data);
                            }} style={{ accentColor: 'var(--color-purple-500)' }} />
                        </label>
                    </div>
                    {cliente.portal_ativo && cliente.portal_hash && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input readOnly value={`${window.location.origin}/portal/${cliente.portal_hash}`} className="form-input" style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem 0.6rem', color: 'var(--text-muted)' }} />
                                <button onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/portal/${cliente.portal_hash}`);
                                    alert('Link copiado!');
                                }} className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>Copiar</button>
                            </div>
                            {cliente.ultimo_acesso_portal ? (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Último acesso: {new Date(cliente.ultimo_acesso_portal).toLocaleString('pt-BR')}</p>
                            ) : (
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Nunca acessado</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {[
                { icon: Mail, label: 'Email', value: cliente.email },
                { icon: Phone, label: 'Telefone', value: cliente.telefone },
                { icon: Tag, label: 'Serviço', value: cliente.servico },
                { icon: Calendar, label: 'Início', value: cliente.data_inicio ? new Date(cliente.data_inicio).toLocaleDateString('pt-BR') : null },
            ].map(r => r.value ? (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
                    <r.icon size={16} style={{ color: 'var(--color-purple-500)', flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{r.label}</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{r.value}</p>
                    </div>
                </div>
            ) : null)}

            {cliente.observacoes && (
                <div style={{ padding: '0.875rem', background: 'var(--bg-tertiary)', borderRadius: '0.625rem', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '0.375rem' }}>Observações</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{cliente.observacoes}</p>
                </div>
            )}

            {user?.is_admin_matriz && (
                <button onClick={onEdit} className="btn-secondary" style={{ justifyContent: 'center' }}>
                    <Pencil size={14} /> Editar Cliente
                </button>
            )}
        </div>
    )
}


function DrawerAnotacoes({ clienteId }: { clienteId: string }) {
    const [anotacoes, setAnotacoes] = useState<any[]>([])
    const [titulo, setTitulo] = useState('')
    const [conteudo, setConteudo] = useState('')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/clientes/${clienteId}/anotacoes`).then(r => r.json()).then(d => setAnotacoes(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }, [clienteId])

    const salvar = async () => {
        if (!conteudo.trim()) return
        setSaving(true)
        await fetch(`/api/clientes/${clienteId}/anotacoes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ titulo, conteudo }) })
        setSaving(false)
        setTitulo(''); setConteudo('')
        fetch(`/api/clientes/${clienteId}/anotacoes`).then(r => r.json()).then(d => setAnotacoes(Array.isArray(d) ? d : []))
    }

    const deletar = async (id: string) => {
        await fetch(`/api/clientes/${clienteId}/anotacoes?anotacao_id=${id}`, { method: 'DELETE' })
        setAnotacoes(a => a.filter(x => x.id !== id))
    }

    return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border)' }}>
                <input placeholder="Título (opcional)" value={titulo} onChange={e => setTitulo(e.target.value)} className="form-input" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }} />
                <textarea placeholder="Escreva sua anotação..." value={conteudo} onChange={e => setConteudo(e.target.value)} className="form-input" style={{ resize: 'none', height: '100px', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                <button onClick={salvar} disabled={saving || !conteudo.trim()} className="btn-primary" style={{ marginTop: '0.75rem', width: '100%', justifyContent: 'center' }}>
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {saving ? 'Salvando...' : 'Salvar Anotação'}
                </button>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} /></div> :
                anotacoes.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>Nenhuma anotação ainda</p> :
                    anotacoes.map(a => (
                        <div key={a.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{a.titulo || 'Sem título'}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeAgo(a.created_at)}</span>
                                    <button onClick={() => deletar(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.1rem' }}><X size={13} /></button>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{a.conteudo}</p>
                        </div>
                    ))
            }
        </div>
    )
}

function DrawerSenhas({ clienteId }: { clienteId: string }) {
    const [senhas, setSenhas] = useState<any[]>([])
    const [visivel, setVisivel] = useState<Record<string, boolean>>({})
    const [form, setForm] = useState({ titulo: '', login: '', senha: '', url: '', notas: '' })
    const [showForm, setShowForm] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/clientes/${clienteId}/senhas`).then(r => r.json()).then(d => setSenhas(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }, [clienteId])

    const salvar = async () => {
        if (!form.titulo) return
        setSaving(true)
        await fetch(`/api/clientes/${clienteId}/senhas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        setSaving(false); setShowForm(false); setForm({ titulo: '', login: '', senha: '', url: '', notas: '' })
        fetch(`/api/clientes/${clienteId}/senhas`).then(r => r.json()).then(d => setSenhas(Array.isArray(d) ? d : []))
    }

    const deletar = async (id: string) => {
        await fetch(`/api/clientes/${clienteId}/senhas?senha_id=${id}`, { method: 'DELETE' })
        setSenhas(s => s.filter(x => x.id !== id))
    }

    return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ justifyContent: 'center' }}>
                <Plus size={14} /> Nova Entrada
            </button>

            {showForm && (
                <div style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <input placeholder="Título *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                    <input placeholder="Login / Usuário" value={form.login} onChange={e => setForm(f => ({ ...f, login: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                    <input placeholder="Senha" type="password" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                    <input placeholder="URL (opcional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                    <textarea placeholder="Notas" value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} className="form-input" style={{ resize: 'none', height: '60px', fontSize: '0.875rem', fontFamily: 'inherit' }} />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={salvar} disabled={saving} className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Salvando...' : 'Salvar'}</button>
                        <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                    </div>
                </div>
            )}

            {loading ? <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} /></div> :
                senhas.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>Nenhuma senha salva</p> :
                    senhas.map(s => (
                        <div key={s.id} className="senha-item">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{s.titulo}</p>
                                {s.login && <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{s.login}</p>}
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                                    {visivel[s.id] ? s.senha : '•'.repeat(Math.min(s.senha?.length || 8, 12))}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                                <button onClick={() => setVisivel(v => ({ ...v, [s.id]: !v[s.id] }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                                    {visivel[s.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                <button onClick={() => deletar(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem' }}><Trash2 size={15} /></button>
                            </div>
                        </div>
                    ))
            }
        </div>
    )
}

function DrawerArquivos({ clienteId }: { clienteId: string }) {
    const [arquivos, setArquivos] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/clientes/${clienteId}/arquivos`).then(r => r.json()).then(d => setArquivos(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }, [clienteId])

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        const reader = new FileReader()
        reader.onload = async () => {
            await fetch(`/api/clientes/${clienteId}/arquivos`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome: file.name, tamanho: file.size, tipo: file.type, dados_base64: reader.result as string })
            })
            setUploading(false)
            fetch(`/api/clientes/${clienteId}/arquivos`).then(r => r.json()).then(d => setArquivos(Array.isArray(d) ? d : []))
        }
        reader.readAsDataURL(file)
    }

    const deletar = async (id: string) => {
        await fetch(`/api/clientes/${clienteId}/arquivos?arquivo_id=${id}`, { method: 'DELETE' })
        setArquivos(a => a.filter(x => x.id !== id))
    }

    const getFileIcon = (tipo: string) => {
        if (tipo.includes('image')) return '🖼️'
        if (tipo.includes('pdf')) return '📄'
        if (tipo.includes('word') || tipo.includes('doc')) return '📝'
        if (tipo.includes('sheet') || tipo.includes('excel')) return '📊'
        return '📎'
    }

    return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <input type="file" ref={inputRef} onChange={handleFile} style={{ display: 'none' }} />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="btn-primary" style={{ justifyContent: 'center' }}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? 'Enviando...' : 'Fazer Upload'}
            </button>

            {loading ? <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} /></div> :
                arquivos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '0.75rem' }}>
                        <Paperclip size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                        <p style={{ fontSize: '0.875rem' }}>Nenhum arquivo enviado</p>
                    </div>
                ) : arquivos.map(a => (
                    <div key={a.id} className="file-item">
                        <span style={{ fontSize: '1.25rem' }}>{getFileIcon(a.tipo)}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nome}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatBytes(a.tamanho)} · {timeAgo(a.created_at)}</p>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', marginLeft: '0.5rem' }}>
                                    <input type="checkbox" checked={a.visivel_portal || false} onChange={async (e) => {
                                        const visivel = e.target.checked;
                                        await fetch(`/api/clientes/${clienteId}/arquivos`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ arquivo_id: a.id, visivel_portal: visivel }) });
                                        setArquivos(arr => arr.map(x => x.id === a.id ? { ...x, visivel_portal: visivel } : x));
                                    }} style={{ accentColor: 'var(--color-purple-500)', width: '12px', height: '12px' }} />
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-primary)' }}>Portal</span>
                                </label>
                            </div>
                        </div>
                        <button onClick={() => deletar(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.25rem', flexShrink: 0 }}><Trash2 size={15} /></button>
                    </div>
                ))
            }
        </div>
    )
}

function DrawerTarefas({ clienteId }: { clienteId: string }) {
    const [tarefas, setTarefas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const STATUS_LABEL: Record<string, string> = { a_fazer: 'A Fazer', em_andamento: 'Andamento', concluida: 'Concluída' }
    const PRIO_LABEL: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }

    useEffect(() => {
        setLoading(true)
        fetch('/api/tarefas').then(r => r.json()).then(d => {
            setTarefas((Array.isArray(d) ? d : []).filter((t: any) => t.cliente_id === clienteId))
        }).finally(() => setLoading(false))
    }, [clienteId])

    return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading ? <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} /></div> :
                tarefas.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem' }}>Nenhuma tarefa vinculada</p> :
                    tarefas.map(t => (
                        <div key={t.id} style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '0.875rem 1rem', border: '1px solid var(--border)', borderLeft: `3px solid ${t.prioridade === 'alta' ? '#ef4444' : t.prioridade === 'media' ? '#f59e0b' : '#10b981'}` }}>
                            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{t.titulo}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span className={`badge badge-${t.prioridade}`}>{PRIO_LABEL[t.prioridade]}</span>
                                <span className={`badge badge-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                                {t.prazo && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Prazo: {t.prazo}</span>}
                                {t.visivel_portal && <span style={{ fontSize: '0.7rem', color: 'var(--color-purple-500)', alignSelf: 'center', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Eye size={10} /> Portal</span>}
                            </div>
                        </div>
                    ))
            }
        </div>
    )
}

// ── Histórico ──────────────────────────────────────────
const TIPO_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    cliente_criado: { icon: UserCheck, color: '#7c3aed', label: 'Cliente criado' },
    cliente_editado: { icon: FileEdit, color: '#6366f1', label: 'Cliente editado' },
    status_alterado: { icon: AlertCircle, color: '#f59e0b', label: 'Status alterado' },
    tarefa_criada: { icon: FilePlus2, color: '#2563eb', label: 'Tarefa criada' },
    tarefa_concluida: { icon: CheckSquare, color: '#10b981', label: 'Tarefa concluída' },
    anotacao_criada: { icon: StickyNote, color: '#8b5cf6', label: 'Anotação criada' },
    anotacao_removida: { icon: StickyNote, color: '#ef4444', label: 'Anotação removida' },
    arquivo_enviado: { icon: FilePlus2, color: '#059669', label: 'Arquivo enviado' },
    arquivo_removido: { icon: FileX2, color: '#ef4444', label: 'Arquivo removido' },
}

function timeAgoFull(iso: string) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000
    if (diff < 60) return 'agora'
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`
    if (diff < 604800) return `há ${Math.floor(diff / 86400)} dias`
    return new Date(iso).toLocaleDateString('pt-BR')
}

function DrawerHistorico({ clienteId }: { clienteId: string }) {
    const [atividades, setAtividades] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        fetch(`/api/clientes/${clienteId}/atividades`)
            .then(r => r.json())
            .then(d => setAtividades(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false))
    }, [clienteId])

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}><Loader2 size={20} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} /></div>
    if (atividades.length === 0) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}><History size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} /><p>Nenhuma atividade registrada</p></div>

    return (
        <div style={{ padding: '1.25rem' }}>
            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                {/* Vertical line */}
                <div style={{ position: 'absolute', left: '11px', top: '8px', bottom: '0', width: '2px', background: 'var(--border)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {atividades.map((a, i) => {
                        const cfg = TIPO_CONFIG[a.tipo] || { icon: History, color: 'var(--text-muted)', label: a.tipo }
                        const Icon = cfg.icon
                        return (
                            <div key={a.id} style={{ display: 'flex', gap: '0.875rem', paddingBottom: '1.25rem', position: 'relative' }}>
                                {/* Dot */}
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-secondary)', border: `2px solid ${cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '-1.5rem', zIndex: 1 }}>
                                    <Icon size={11} style={{ color: cfg.color }} />
                                </div>
                                <div style={{ flex: 1, paddingTop: '2px' }}>
                                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{a.descricao}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.usuario_nome}</span>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--border-strong)' }}>·</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{timeAgoFull(a.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// ── Horas ──────────────────────────────────────────────
function DrawerHoras({ clienteId }: { clienteId: string }) {
    const [horas, setHoras] = useState<any[]>([])
    const [tarefas, setTarefas] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ descricao: '', horas: '', data: new Date().toISOString().slice(0, 10), tarefa_id: '' })

    const reloadHoras = () =>
        fetch(`/api/clientes/${clienteId}/horas`).then(r => r.json()).then(d => setHoras(Array.isArray(d) ? d : []))

    useEffect(() => {
        setLoading(true)
        Promise.all([
            fetch(`/api/clientes/${clienteId}/horas`).then(r => r.json()),
            fetch('/api/tarefas').then(r => r.json()),
        ]).then(([h, t]) => {
            setHoras(Array.isArray(h) ? h : [])
            setTarefas((Array.isArray(t) ? t : []).filter((x: any) => x.cliente_id === clienteId))
        }).finally(() => setLoading(false))
    }, [clienteId])

    const salvar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.descricao || !form.horas || !form.data) return
        setSaving(true)
        await fetch(`/api/clientes/${clienteId}/horas`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, horas: parseFloat(form.horas), tarefa_id: form.tarefa_id || null }),
        })
        setSaving(false)
        setForm(f => ({ ...f, descricao: '', horas: '', tarefa_id: '' }))
        reloadHoras()
    }

    const deletar = async (id: string) => {
        await fetch(`/api/clientes/${clienteId}/horas?hora_id=${id}`, { method: 'DELETE' })
        setHoras(h => h.filter((x: any) => x.id !== id))
    }

    const mesMes = new Date().toISOString().slice(0, 7)
    const totalMes = horas.filter(h => h.data?.startsWith(mesMes)).reduce((s, h) => s + h.horas, 0)
    const totalGeral = horas.reduce((s, h) => s + h.horas, 0)

    return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Totalizadores */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-purple-500)' }}>{totalMes.toFixed(1)}h</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Este mês</p>
                </div>
                <div style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalGeral.toFixed(1)}h</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total geral</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={salvar} style={{ background: 'var(--bg-tertiary)', borderRadius: '0.75rem', padding: '1rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.125rem' }}>Registrar Horas</p>
                <input required placeholder="Descrição do que foi feito *" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <input required type="number" step="0.25" min="0.25" placeholder="Horas *" value={form.horas} onChange={e => setForm(f => ({ ...f, horas: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                    <input required type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }} />
                </div>
                {tarefas.length > 0 && (
                    <select value={form.tarefa_id} onChange={e => setForm(f => ({ ...f, tarefa_id: e.target.value }))} className="form-input" style={{ fontSize: '0.875rem' }}>
                        <option value="">Vincular à tarefa (opcional)</option>
                        {tarefas.map(t => <option key={t.id} value={t.id}>{t.titulo}</option>)}
                    </select>
                )}
                <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.25rem' }}>
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    {saving ? 'Salvando...' : 'Registrar'}
                </button>
            </form>

            {/* Lista */}
            {loading ? <div style={{ textAlign: 'center', padding: '1rem' }}><Loader2 size={18} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} /></div> :
                horas.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>Nenhum registro ainda</p> :
                    horas.map((h: any) => {
                        const vinculada = tarefas.find(t => t.id === h.tarefa_id)
                        return (
                            <div key={h.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.625rem', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-purple-500)' }}>{h.horas}h</p>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.descricao}</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{h.data}</span>
                                        {vinculada && <span style={{ fontSize: '0.7rem', color: 'var(--color-purple-500)', fontWeight: 500 }}>· {vinculada.titulo}</span>}
                                    </div>
                                </div>
                                <button onClick={() => deletar(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem', flexShrink: 0 }}><Trash2 size={14} /></button>
                            </div>
                        )
                    })
            }
        </div>
    )
}

// ── Client Drawer ───────────────────────────────────────
function ClientDrawer({ cliente, user, onClose, onEdit, onUpdate }: any) {
    const [tab, setTab] = useState<TabId>('info')
    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: 'info', label: 'Informações', icon: FileText },
        { id: 'anotacoes', label: 'Anotações', icon: FileText },
        { id: 'senhas', label: 'Senhas', icon: Key },
        { id: 'arquivos', label: 'Arquivos', icon: Paperclip },
        { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
        { id: 'horas', label: 'Horas', icon: Clock },
        { id: 'historico', label: 'Histórico', icon: History },
    ]

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className="drawer-panel">
                {/* Header */}
                <div style={{ padding: '1.25rem 1.25rem 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>{cliente.nome}</h2>
                            {cliente.servico && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: SERVICE_COLORS[cliente.servico] || 'var(--color-purple-500)', flexShrink: 0 }} />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cliente.servico}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                            <X size={20} />
                        </button>
                    </div>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {tab === 'info' && <DrawerInfo cliente={cliente} user={user} onEdit={onEdit} onUpdate={onUpdate} />}
                    {tab === 'anotacoes' && <DrawerAnotacoes clienteId={cliente.id} />}
                    {tab === 'senhas' && <DrawerSenhas clienteId={cliente.id} />}
                    {tab === 'arquivos' && <DrawerArquivos clienteId={cliente.id} />}
                    {tab === 'tarefas' && <DrawerTarefas clienteId={cliente.id} />}
                    {tab === 'horas' && <DrawerHoras clienteId={cliente.id} />}
                    {tab === 'historico' && <DrawerHistorico clienteId={cliente.id} />}
                </div>
            </div>
        </>
    )
}

// ── Main Page ────────────────────────────────────────────
const emptyFormInit = { nome: '', email: '', telefone: '', servico: '', valor_mensal: '', tipo_contrato: 'fixo' as TipoContrato, data_inicio: '', status: 'ativo' as StatusCliente, observacoes: '' }

export default function ClientesPage() {
    const [clientes, setClientes] = useState<any[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ ...emptyFormInit })
    const [drawerCliente, setDrawerCliente] = useState<any>(null)
    const [healthMap, setHealthMap] = useState<Record<string, any>>({})
    const [onboardingId, setOnboardingId] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
        load()
        fetch('/api/clientes/health-all').then(r => r.json()).then(d => { if (d && typeof d === 'object') setHealthMap(d) }).catch(() => { })
    }, [])

    const load = () => {
        setLoading(true)
        fetch('/api/clientes').then(r => r.json()).then(data => setClientes(Array.isArray(data) ? data : [])).finally(() => setLoading(false))
    }

    const openCreate = () => { setEditing(null); setForm({ ...emptyFormInit }); setShowModal(true) }
    const openEdit = (c: any) => {
        setEditing(c)
        setForm({ nome: c.nome, email: c.email || '', telefone: c.telefone || '', servico: c.servico || '', valor_mensal: c.valor_mensal ?? '', tipo_contrato: c.tipo_contrato, data_inicio: c.data_inicio || '', status: c.status, observacoes: c.observacoes || '' })
        setShowModal(true)
        setDrawerCliente(null)
    }
    const handleDelete = async (id: string) => {
        if (!confirm('Excluir este cliente?')) return
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
        load()
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        const url = editing ? `/api/clientes/${editing.id}` : '/api/clientes'
        const method = editing ? 'PUT' : 'POST'
        const body = { ...form, valor_mensal: form.valor_mensal ? parseFloat(form.valor_mensal as any) : null }
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const result = await res.json()
        setSaving(false); setShowModal(false); load()

        // If it was a new client, trigger onboarding
        if (res.status === 201 && result.id) {
            setOnboardingId(result.id)
        }
    }

    const filtered = clientes.filter(c =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.servico || '').toLowerCase().includes(search.toLowerCase())
    )

    // Group by service
    const grouped: Record<string, any[]> = {}
    filtered.forEach(c => {
        const key = c.servico || 'Sem Categoria'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(c)
    })

    return (
        <div>
            {drawerCliente && (
                <ClientDrawer
                    cliente={drawerCliente} user={user}
                    onClose={() => setDrawerCliente(null)}
                    onEdit={() => openEdit(drawerCliente)}
                    onUpdate={(updatedCliente: any) => {
                        setDrawerCliente(updatedCliente)
                        setClientes(cs => cs.map(c => c.id === updatedCliente.id ? updatedCliente : c))
                    }}
                />
            )}

            {/* Page header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Clientes</h1>
                    <p className="page-subtitle">{clientes.length} clientes · {clientes.filter(c => c.status === 'ativo').length} ativos</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {user?.is_admin_matriz && (
                        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Novo Cliente</button>
                    )}
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" style={{ paddingLeft: '2.5rem', maxWidth: '380px' }} placeholder="Buscar por nome, email ou serviço..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem' }}>
                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)' }}>
                    <Building2 size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                    <p style={{ fontSize: '0.875rem' }}>Nenhum cliente encontrado</p>
                    {user?.is_admin_matriz && <button onClick={openCreate} className="btn-primary" style={{ marginTop: '1rem' }}>Adicionar cliente</button>}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Object.entries(grouped).map(([servico, items]) => {
                        const color = SERVICE_COLORS[servico] || 'var(--color-purple-500)'
                        return (
                            <div key={servico}>
                                {/* Service group header */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                    <h3 style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{servico}</h3>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '999px', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color }}>{items.length}</span>
                                    </div>
                                    <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                                </div>

                                {/* Client cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.875rem' }}>
                                    {items.map(c => (
                                        <div
                                            key={c.id}
                                            className="card"
                                            onClick={() => setDrawerCliente(c)}
                                            style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', borderTop: `3px solid ${color}` }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color, flexShrink: 0 }}>
                                                        {c.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.nome}</p>
                                                            {healthMap[c.id] && (
                                                                <span title={`Health: ${healthMap[c.id].level} (${healthMap[c.id].score}/100)`} style={{ width: '8px', height: '8px', borderRadius: '50%', background: HEALTH_COLOR[healthMap[c.id].level] || '#ccc', flexShrink: 0, display: 'inline-block' }} />
                                                            )}
                                                        </div>
                                                        {c.email && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</p>}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
                                                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                    <span className={`badge badge-${c.status}`}>{STATUS_LABEL[c.status as StatusCliente]}</span>
                                                    <span className={`badge badge-${c.tipo_contrato}`}>{c.tipo_contrato === 'fixo' ? 'Fixo' : 'Freelance'}</span>
                                                </div>
                                                {user?.is_admin_matriz && c.valor_mensal && (
                                                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{formatCurrency(c.valor_mensal)}</p>
                                                )}
                                            </div>
                                            {user?.is_admin_matriz && (
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                                                    <button onClick={() => openEdit(c)} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem' }}><Pencil size={12} /> Editar</button>
                                                    <button onClick={() => handleDelete(c.id)} className="btn-ghost" style={{ color: '#ef4444', fontSize: '0.75rem' }}><Trash2 size={12} /></button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modal Create/Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="form-label">Nome *</label>
                                    <input className="form-input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                                </div>
                                <div><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                                <div><label className="form-label">Telefone</label><input className="form-input" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} /></div>
                                <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Serviço Prestado</label><input className="form-input" value={form.servico} onChange={e => setForm(f => ({ ...f, servico: e.target.value }))} /></div>
                                <div><label className="form-label">Valor Mensal (R$)</label><input className="form-input" type="number" step="0.01" value={form.valor_mensal} onChange={e => setForm(f => ({ ...f, valor_mensal: e.target.value }))} /></div>
                                <div><label className="form-label">Tipo de Contrato</label>
                                    <select className="form-input" value={form.tipo_contrato} onChange={e => setForm(f => ({ ...f, tipo_contrato: e.target.value as TipoContrato }))}>
                                        <option value="fixo">Fixo</option><option value="freelance">Freelance</option>
                                    </select>
                                </div>
                                <div><label className="form-label">Data de Início</label><input className="form-input" type="date" value={form.data_inicio} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))} /></div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label className="form-label">Horas Planejadas / Semanal</label>
                                            <input className="form-input" type="number" step="0.5" min="0" value={form.horas_semanais_planejadas || ''} onChange={e => setForm(f => ({ ...f, horas_semanais_planejadas: e.target.value ? Number(e.target.value) : '' }))} placeholder="Ex: 10" />
                                        </div>
                                        <div>
                                            <label className="form-label">Status</label>
                                            <select className="form-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StatusCliente }))}>
                                                <option value="ativo">Ativo</option><option value="pausado">Pausado</option><option value="encerrado">Encerrado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Observações</label><textarea className="form-input" style={{ resize: 'none', fontFamily: 'inherit' }} rows={3} value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} /></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.25rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Criar Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Modal de Onboarding */}
            {onboardingId && <OnboardingModal clienteId={onboardingId} onClose={() => setOnboardingId(null)} />}
        </div>
    )
}

function OnboardingModal({ clienteId, onClose }: { clienteId: string, onClose: () => void }) {
    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState('')
    const [applying, setApplying] = useState(false)

    useEffect(() => {
        fetch('/api/templates').then(r => r.json()).then(d => {
            setTemplates(Array.isArray(d) ? d : [])
            setLoading(false)
        })
    }, [])

    const handleApply = async () => {
        if (!selected) return
        setApplying(true)
        await fetch(`/api/clientes/${clienteId}/aplicar-template`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ template_id: selected })
        })
        setApplying(false)
        onClose()
    }

    return (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
            <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '2rem' }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '15px',
                    background: 'rgba(124,58,237,0.1)', color: 'var(--color-purple-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1.25rem'
                }}>
                    <Sparkles size={30} />
                </div>

                <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Novo Cliente Criado!</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Deseja aplicar um <strong>template de onboarding</strong> para automatizar a criação das primeiras tarefas?
                </p>

                {loading ? (
                    <div style={{ padding: '1rem' }}><Loader2 size={24} className="animate-spin" style={{ color: 'var(--color-purple-500)', margin: '0 auto' }} /></div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select
                            className="form-input"
                            value={selected}
                            onChange={e => setSelected(e.target.value)}
                            style={{ textAlign: 'center', fontWeight: 600 }}
                        >
                            <option value="">-- Selecione um Template --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.nome} ({t.tarefas?.length || 0} tarefas)</option>
                            ))}
                        </select>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button onClick={onClose} className="btn-secondary" style={{ justifyContent: 'center' }}>Pular agora</button>
                            <button
                                onClick={handleApply}
                                disabled={!selected || applying}
                                className="btn-primary"
                                style={{ justifyContent: 'center' }}
                            >
                                {applying ? <Loader2 size={16} className="animate-spin" /> : <LayoutTemplate size={16} />}
                                {applying ? 'Aplicando...' : 'Aplicar'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

