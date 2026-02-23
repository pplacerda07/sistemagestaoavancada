'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Zap } from 'lucide-react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [senha, setSenha] = useState('')
    const [showPwd, setShowPwd] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, senha }),
            })
            const data = await res.json()
            if (!res.ok) { setError(data.error || 'Credenciais inválidas'); return }
            router.push('/dashboard')
        } catch {
            setError('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#0d0920' }}>
            {/* Left panel */}
            <div style={{
                width: '50%', background: 'linear-gradient(135deg, #1e1040 0%, #2d1b69 60%, #4c1d95 100%)',
                position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '3rem',
            }} className="hidden lg:flex">
                {/* BG glows */}
                <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(124,58,237,0.2)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(76,29,149,0.25)', filter: 'blur(100px)' }} />

                {/* Logo */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
                        <Zap size={20} color="white" fill="white" />
                    </div>
                    <div>
                        <p style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>Fiora Agency</p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Sistema de Gestão CRM</p>
                    </div>
                </div>

                {/* Headline */}
                <div style={{ position: 'relative' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>
                        Gerencie seus clientes<br />
                        <span style={{ background: 'linear-gradient(135deg, #a78bfa, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            com precisão
                        </span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '360px' }}>
                        Plataforma completa para agências gerenciarem clientes, tarefas, equipes e finanças em um só lugar.
                    </p>
                </div>

                {/* Stats */}
                <div style={{ position: 'relative', display: 'flex', gap: '2.5rem' }}>
                    {[
                        { value: '100%', label: 'Seguro' },
                        { value: 'Real-time', label: 'Atualizações' },
                        { value: 'Multi-perfil', label: 'Acessos' },
                    ].map(s => (
                        <div key={s.label}>
                            <p style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{s.value}</p>
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0d0920' }}>
                <div style={{ width: '100%', maxWidth: '400px' }}>
                    {/* Mobile logo */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="lg:hidden">
                        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #7c3aed, #4c1d95)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                            <Zap size={22} color="white" fill="white" />
                        </div>
                        <h2 style={{ color: '#fff', fontWeight: 700 }}>Fiora Agency</h2>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.04)', borderRadius: '1.25rem',
                        border: '1px solid rgba(124,58,237,0.25)', padding: '2.5rem',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', marginBottom: '0.375rem' }}>Bem-vindo!</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                            Entre com suas credenciais para acessar o sistema.
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Usuário</label>
                                <input
                                    type="text" required autoFocus
                                    value={username} onChange={e => setUsername(e.target.value)}
                                    placeholder="nome.usuario"
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '1.5px solid rgba(124,58,237,0.3)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>Senha</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPwd ? 'text' : 'password'} required
                                        value={senha} onChange={e => setSenha(e.target.value)}
                                        placeholder="••••••••"
                                        style={{ width: '100%', padding: '0.75rem 2.75rem 0.75rem 1rem', borderRadius: '0.625rem', border: '1.5px solid rgba(124,58,237,0.3)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
                                    />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#fca5a5', fontSize: '0.825rem' }}>
                                    {error}
                                </div>
                            )}

                            <button type="submit" disabled={loading} style={{
                                padding: '0.875rem', borderRadius: '0.625rem', border: 'none',
                                background: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
                                color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                boxShadow: '0 4px 16px rgba(124,58,237,0.4)', opacity: loading ? 0.7 : 1, transition: 'all 0.15s',
                                fontFamily: 'inherit',
                            }}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
                        Acesso restrito. Solicite seu cadastro ao administrador.
                    </p>
                </div>
            </div>
        </div>
    )
}
