'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, LayoutTemplate, CheckSquare, Paperclip, Send, AlertCircle, FileText, CheckCircle2, Circle } from 'lucide-react'

// Simple helper functions that do not require server logic
function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / 1048576).toFixed(1)} MB`
}

export default function PortalPage() {
    const params = useParams()
    const hash = params.hash as string

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [mensagem, setMensagem] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [sucesso, setSucesso] = useState(false)

    useEffect(() => {
        if (!hash) return
        setLoading(true)
        fetch(`/api/portal/${hash}`)
            .then(async r => {
                if (!r.ok) {
                    const err = await r.json()
                    throw new Error(err.error || 'Erro ao carregar o portal')
                }
                return r.json()
            })
            .then(d => setData(d))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [hash])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!mensagem.trim()) return

        setEnviando(true)
        try {
            const res = await fetch(`/api/portal/${hash}/mensagens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem })
            })
            if (!res.ok) throw new Error('Falha ao enviar')
            setMensagem('')
            setSucesso(true)
            setTimeout(() => setSucesso(false), 5000)
        } catch (e) {
            alert('Erro ao enviar mensagem. Tente novamente.')
        } finally {
            setEnviando(false)
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem' }}>
                <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Portal Indisponível</h1>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{error || 'Link inválido ou portal desativado.'}</p>
            </div>
        )
    }

    const { cliente, tarefas, arquivos } = data

    // Calculate progress
    const totalTarefas = tarefas.length
    const tarefasConcluidas = tarefas.filter((t: any) => t.status === 'concluida').length
    const progresso = totalTarefas === 0 ? 0 : Math.round((tarefasConcluidas / totalTarefas) * 100)

    const STATUS_COLORS: Record<string, string> = { ativo: '#10b981', pausado: '#f59e0b', encerrado: '#ef4444' }
    const STATUS_LABEL: Record<string, string> = { ativo: 'Em Andamento', pausado: 'Pausado', encerrado: 'Encerrado' }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-purple-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <LayoutTemplate size={20} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)' }}>Portal do Cliente</h1>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cliente.nome}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLORS[cliente.status] || '#ccc' }} />
                            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{STATUS_LABEL[cliente.status] || 'Desconhecido'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main style={{ flex: 1, padding: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Overview Row */}
                <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)' }}>
                        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Progresso das Tarefas</h2>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-purple-500)', lineHeight: 1 }}>{progresso}%</span>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>Concluído</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                            <div style={{ width: `${progresso}%`, height: '100%', background: 'var(--color-purple-500)', borderRadius: '99px', transition: 'width 1s ease-out' }} />
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {tarefasConcluidas} de {totalTarefas} tarefas finalizadas
                        </p>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Send size={14} /> Enviar Mensagem
                        </h2>
                        <form onSubmit={handleSendMessage} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <textarea
                                value={mensagem}
                                onChange={e => setMensagem(e.target.value)}
                                placeholder="Dúvidas, aprovações ou solicitações..."
                                style={{ flex: 1, resize: 'none', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.75rem', color: 'var(--text-primary)', fontSize: '0.875rem', fontFamily: 'inherit' }}
                                required
                            />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontSize: '0.75rem', color: sucesso ? '#10b981' : 'transparent', fontWeight: 500, transition: 'color 0.3s' }}>
                                    ✓ Mensagem enviada
                                </span>
                                <button type="submit" disabled={enviando || !mensagem.trim()} style={{ background: 'var(--color-purple-500)', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.825rem', fontWeight: 600, cursor: enviando || !mensagem.trim() ? 'not-allowed' : 'pointer', opacity: enviando || !mensagem.trim() ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {enviando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    {enviando ? 'Enviando...' : 'Enviar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>

                    {/* Tarefas List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckSquare size={18} style={{ color: 'var(--color-purple-500)' }} /> Quadro de Tarefas
                        </h2>

                        {tarefas.length === 0 ? (
                            <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p>Nenhuma tarefa visível no momento.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {tarefas.map((t: any, i: number) => {
                                    const isDone = t.status === 'concluida'
                                    const isDoing = t.status === 'em_andamento'
                                    return (
                                        <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', gap: '1rem', opacity: isDone ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                                            <div style={{ marginTop: '0.1rem' }}>
                                                {isDone ? <CheckCircle2 size={18} style={{ color: '#10b981' }} /> :
                                                    isDoing ? <Circle size={18} style={{ color: '#f59e0b', fill: '#f59e0b20' }} /> :
                                                        <Circle size={18} style={{ color: 'var(--border-strong)' }} />}
                                            </div>
                                            <div>
                                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: isDone ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', marginBottom: '0.3rem' }}>{t.titulo}</p>
                                                {t.descricao && <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.descricao}</p>}
                                                <div style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '99px', background: isDone ? '#d1fae5' : isDoing ? '#fef3c7' : 'var(--bg-primary)', color: isDone ? '#065f46' : isDoing ? '#92400e' : 'var(--text-secondary)' }}>
                                                    {isDone ? 'Concluída' : isDoing ? 'Em Andamento' : 'A Fazer'}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Arquivos List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Paperclip size={18} style={{ color: 'var(--color-purple-500)' }} /> Arquivos
                        </h2>

                        {arquivos.length === 0 ? (
                            <div style={{ background: 'var(--bg-secondary)', border: '1px dashed var(--border)', borderRadius: '1rem', padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                <p style={{ fontSize: '0.85rem' }}>Nenhum arquivo compartilhado.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {arquivos.map((a: any, i: number) => (
                                    <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                                            <FileText size={16} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.nome}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatBytes(a.tamanho)}</p>
                                        </div>
                                        {a.url && (
                                            <a href={`/api/portal/${hash}/arquivos/${a.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-purple-500)', textDecoration: 'none' }}>
                                                Baixar
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
