'use client'

import { useState, useEffect } from 'react'
import { Loader2, Lightbulb, Trash2, CheckCircle2 } from 'lucide-react'

export default function IdeiasPage() {
    const [ideias, setIdeias] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        fetch('/api/ideias')
            .then(r => r.json())
            .then(d => setIdeias(Array.isArray(d) ? d : []))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const handleAction = async (id: string, action: 'delete' | 'convert') => {
        if (action === 'delete') {
            if (!confirm('Descartar ideia?')) return
            await fetch(`/api/ideias/${id}`, { method: 'DELETE' })
        } else {
            // Update status to 'convertida'
            await fetch(`/api/ideias/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'convertida' })
            })
            // Here we could open a modal to actually create a Task/Anotacao, 
            // but for simplicity we just mark it as handled in this step.
            alert('Ideia marcada como resolvida/convertida.')
        }
        load()
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lightbulb size={24} style={{ color: '#f59e0b' }} /> Inbox de Ideias
                    </h1>
                    <p className="page-subtitle">Anotações rápidas e capturas não organizadas.</p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
                </div>
            ) : ideias.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-secondary)', borderRadius: '1rem', border: '1px dashed var(--border)' }}>
                    <Lightbulb size={40} style={{ margin: '0 auto 1rem', opacity: 0.2, color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)' }}>Sua caixa de entrada está limpa.</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Use <kbd style={{ padding: '0.1rem 0.3rem', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>Ctrl+I</kbd> para capturar rapidamente de qualquer tela.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ideias.map(i => (
                        <div key={i.id} style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '0.75rem',
                            padding: '1.25rem',
                            display: 'flex', gap: '1rem',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{i.texto}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Criada em: {new Date(i.created_at).toLocaleString('pt-BR')}</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexShrink: 0 }}>
                                <button onClick={() => handleAction(i.id, 'convert')} style={{
                                    background: '#10b98115', color: '#10b981', border: 'none', borderRadius: '0.375rem',
                                    padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }} title="Marcar como processada">
                                    <CheckCircle2 size={16} />
                                </button>
                                <button onClick={() => handleAction(i.id, 'delete')} style={{
                                    background: '#ef444415', color: '#ef4444', border: 'none', borderRadius: '0.375rem',
                                    padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }} title="Descartar">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
