'use client'

import { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Clock, Activity, FileText, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

type AlertLevel = 'urgente' | 'aviso'
type AlertTipo = 'tarefa_prazo' | 'sem_atividade' | 'health_critico' | 'contrato_vencendo'

interface Alert {
    id: string
    tipo: AlertTipo
    level: AlertLevel
    clienteId: string
    clienteNome: string
    descricao: string
    href: string
}

const TIPO_CONFIG: Record<AlertTipo, { icon: any; label: string; color: string }> = {
    tarefa_prazo: { icon: Clock, label: 'Prazo de tarefa', color: '#ef4444' },
    sem_atividade: { icon: Activity, label: 'Sem atividade', color: '#f59e0b' },
    health_critico: { icon: AlertTriangle, label: 'Health crítico', color: '#ef4444' },
    contrato_vencendo: { icon: FileText, label: 'Contrato', color: '#f59e0b' },
}

export default function AlertasPage() {
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/alertas').then(r => r.json()).then(d => {
            setAlerts(Array.isArray(d) ? d : [])
        }).finally(() => setLoading(false))
    }, [])

    const urgentes = alerts.filter(a => a.level === 'urgente')
    const avisos = alerts.filter(a => a.level === 'aviso')

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Bell size={22} style={{ color: 'var(--color-purple-500)' }} />
                        Alertas
                    </h1>
                    <p className="page-subtitle">Situações que precisam de atenção</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!loading && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {alerts.length === 0 ? 'Nenhum alerta ativo' : `${alerts.length} alerta${alerts.length > 1 ? 's' : ''} ativo${alerts.length > 1 ? 's' : ''}`}
                        </span>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-purple-500)' }} />
                </div>
            ) : alerts.length === 0 ? (
                <div className="card" style={{ padding: '4rem', textAlign: 'center' }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem', display: 'block' }} />
                    <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Tudo em ordem!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Nenhuma situação requer atenção no momento.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Urgentes */}
                    {urgentes.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                                <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ef4444' }}>
                                    Urgente ({urgentes.length})
                                </h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {urgentes.map(a => <AlertCard key={a.id} alert={a} />)}
                            </div>
                        </div>
                    )}

                    {/* Avisos */}
                    {avisos.length > 0 && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                                <h2 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#f59e0b' }}>
                                    Atenção ({avisos.length})
                                </h2>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                {avisos.map(a => <AlertCard key={a.id} alert={a} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function AlertCard({ alert }: { alert: Alert }) {
    const cfg = TIPO_CONFIG[alert.tipo]
    const Icon = cfg.icon
    const isUrgente = alert.level === 'urgente'
    const accentColor = isUrgente ? '#ef4444' : '#f59e0b'
    const bgColor = isUrgente ? '#fee2e2' : '#fef3c7'

    return (
        <div className="card" style={{
            padding: '1rem 1.25rem',
            borderLeft: `4px solid ${accentColor}`,
            display: 'flex', alignItems: 'center', gap: '1rem',
            transition: 'all 0.15s',
        }}>
            <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: bgColor, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon size={18} style={{ color: accentColor }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span style={{
                        fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', color: accentColor,
                        background: bgColor, padding: '0.1rem 0.4rem', borderRadius: '4px',
                    }}>{cfg.label}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{alert.clienteNome}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>{alert.descricao}</p>
            </div>
            <Link href={alert.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.4rem 0.875rem', borderRadius: '0.5rem',
                background: accentColor, color: 'white',
                fontSize: '0.75rem', fontWeight: 700, textDecoration: 'none',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'opacity 0.15s',
            }}>
                Ver <ArrowRight size={12} />
            </Link>
        </div>
    )
}
