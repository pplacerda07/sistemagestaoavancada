'use client'

import { useState, useRef, useEffect } from 'react'
import { Lightbulb, Send, Loader2, X } from 'lucide-react'

export function QuickCapture() {
    const [open, setOpen] = useState(false)
    const [texto, setTexto] = useState('')
    const [salvando, setSalvando] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    // Focus input when opened
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd+I or Ctrl+I to open
            if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
                e.preventDefault()
                setOpen(true)
            }
            if (e.key === 'Escape' && open) setOpen(false)
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && open) {
                e.preventDefault()
                handleSave()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, texto]) // Need to track texto for handleSave

    const handleSave = async () => {
        if (!texto.trim() || salvando) return

        setSalvando(true)
        try {
            const res = await fetch('/api/ideias', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ texto })
            })
            if (res.ok) {
                setTexto('')
                setOpen(false)
            } else {
                alert('Erro ao salvar ideia.')
            }
        } catch (e) {
            alert('Erro de conexão ao salvar ideia.')
        } finally {
            setSalvando(false)
        }
    }

    return (
        <>
            {/* FAB Button */}
            <button
                onClick={() => setOpen(true)}
                title="Captura Rápida (Ctrl+I)"
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '3.5rem',
                    height: '3.5rem',
                    borderRadius: '50%',
                    background: 'var(--color-purple-500)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(109, 40, 217, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 9999,
                    transition: 'transform 0.2s',
                    ...((open ? { transform: 'scale(0)' } : {}) as any)
                }}
            >
                <Lightbulb size={24} />
            </button>

            {/* Modal */}
            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 10000, backdropFilter: 'blur(2px)' }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: 'fixed',
                        bottom: '3rem',
                        right: '3rem',
                        width: '360px',
                        background: 'var(--bg-secondary)',
                        borderRadius: '1rem',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        zIndex: 10001,
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid var(--border)',
                        overflow: 'hidden',
                        animation: 'slideUp 0.2s ease-out'
                    }}>
                        <style>{`
                            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                        `}</style>

                        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-tertiary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Lightbulb size={16} style={{ color: '#f59e0b' }} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Nova Ideia</span>
                            </div>
                            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={16} />
                            </button>
                        </div>

                        <textarea
                            ref={inputRef}
                            value={texto}
                            onChange={e => setTexto(e.target.value)}
                            placeholder="Descreva a ideia, tarefa solta ou lembrete..."
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                border: 'none',
                                background: 'transparent',
                                padding: '1rem',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />

                        <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Salvar: <kbd style={{ background: 'var(--bg-primary)', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)' }}>Ctrl + Enter</kbd></span>
                            <button
                                onClick={handleSave}
                                disabled={!texto.trim() || salvando}
                                style={{
                                    background: 'var(--text-primary)',
                                    color: 'var(--bg-primary)',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    padding: '0.4rem 0.8rem',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    cursor: !texto.trim() || salvando ? 'not-allowed' : 'pointer',
                                    opacity: !texto.trim() || salvando ? 0.5 : 1
                                }}
                            >
                                {salvando ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                Salvar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}
