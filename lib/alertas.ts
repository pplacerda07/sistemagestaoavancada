import type { DBCliente, DBTarefa, DBAtividade, DBMensagemPortal } from './db/store'

export type AlertLevel = 'urgente' | 'aviso'

export interface Alert {
    id: string
    tipo: 'tarefa_prazo' | 'sem_atividade' | 'health_critico' | 'contrato_vencendo' | 'mensagem_portal'
    level: AlertLevel
    clienteId: string
    clienteNome: string
    descricao: string
    href: string  // CTA destination
}

const MS_DAY = 86400_000

export function calcAlertas(
    clientes: DBCliente[],
    tarefas: DBTarefa[],
    atividades: DBAtividade[],
    mensagens: DBMensagemPortal[] = []
): Alert[] {
    const now = Date.now()
    const alerts: Alert[] = []

    for (const c of clientes) {
        if (c.status === 'encerrado') continue

        const clienteTarefas = tarefas.filter(t => t.cliente_id === c.id)
        const clienteAtividades = atividades.filter(a => a.cliente_id === c.id)

        // 1. Tarefas vencendo em < 48h
        for (const t of clienteTarefas) {
            if (t.status === 'concluida' || !t.prazo) continue
            const prazoMs = new Date(t.prazo + 'T23:59:59').getTime()
            const horasRestantes = (prazoMs - now) / 3_600_000
            if (horasRestantes > 0 && horasRestantes < 48) {
                alerts.push({
                    id: `tarefa-prazo-${t.id}`,
                    tipo: 'tarefa_prazo',
                    level: 'urgente',
                    clienteId: c.id, clienteNome: c.nome,
                    descricao: `Tarefa "${t.titulo}" vence em ${Math.ceil(horasRestantes)}h`,
                    href: '/tarefas',
                })
            }
            // Already overdue
            if (prazoMs < now) {
                alerts.push({
                    id: `tarefa-vencida-${t.id}`,
                    tipo: 'tarefa_prazo',
                    level: 'urgente',
                    clienteId: c.id, clienteNome: c.nome,
                    descricao: `Tarefa "${t.titulo}" está atrasada`,
                    href: '/tarefas',
                })
            }
        }

        // 2. Sem atividade > 7 dias
        const lastActivity = clienteAtividades.length > 0
            ? Math.max(...clienteAtividades.map(a => new Date(a.created_at).getTime()))
            : new Date(c.created_at).getTime()
        const diasSem = (now - lastActivity) / MS_DAY
        if (diasSem > 7) {
            alerts.push({
                id: `sem-atividade-${c.id}`,
                tipo: 'sem_atividade',
                level: diasSem > 30 ? 'urgente' : 'aviso',
                clienteId: c.id, clienteNome: c.nome,
                descricao: `Sem nenhuma atividade há ${Math.floor(diasSem)} dias`,
                href: '/clientes',
            })
        }

        // 3. Contrato vencendo em < 30 dias
        if (c.data_inicio && c.tipo_contrato === 'fixo') {
            const venc = new Date(c.data_inicio).getTime() + 365 * MS_DAY
            const diasParaVencer = (venc - now) / MS_DAY
            if (diasParaVencer >= 0 && diasParaVencer < 30) {
                alerts.push({
                    id: `contrato-vencendo-${c.id}`,
                    tipo: 'contrato_vencendo',
                    level: diasParaVencer < 7 ? 'urgente' : 'aviso',
                    clienteId: c.id, clienteNome: c.nome,
                    descricao: `Contrato fixo vence em ${Math.ceil(diasParaVencer)} dias`,
                    href: '/clientes',
                })
            }
        }

        // 4. Mensagens não lidas do portal
        const unreadMsgs = mensagens.filter(m => m.cliente_id === c.id && !m.lida)
        if (unreadMsgs.length > 0) {
            alerts.push({
                id: `msg-portal-${c.id}`,
                tipo: 'mensagem_portal',
                level: 'urgente',
                clienteId: c.id, clienteNome: c.nome,
                descricao: `${unreadMsgs.length} nova(s) mensagem(ns) no Portal`,
                href: `/clientes`, // Link pra página de clientes
            })
        }
    }

    // Sort: urgente first, then by clienteNome
    return alerts.sort((a, b) => {
        if (a.level !== b.level) return a.level === 'urgente' ? -1 : 1
        return a.clienteNome.localeCompare(b.clienteNome)
    })
}
