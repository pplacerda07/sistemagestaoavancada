import type { DBCliente, DBTarefa, DBAtividade } from './db/store'

export type HealthLevel = 'verde' | 'amarelo' | 'vermelho'

export interface HealthResult {
    level: HealthLevel
    score: number        // 0–100, higher = healthier
    reasons: string[]    // why it's not green
}

const MS_DAY = 86400_000

export function calcHealth(
    cliente: DBCliente,
    tarefas: DBTarefa[],
    atividades: DBAtividade[],
): HealthResult {
    const now = Date.now()
    const reasons: string[] = []
    let demerits = 0

    // 1. Tarefas atrasadas
    const atrasadas = tarefas.filter(t =>
        t.cliente_id === cliente.id &&
        t.status !== 'concluida' &&
        t.prazo &&
        new Date(t.prazo).getTime() < now
    )
    if (atrasadas.length >= 3) { demerits += 40; reasons.push(`${atrasadas.length} tarefas atrasadas`) }
    else if (atrasadas.length >= 1) { demerits += 20; reasons.push(`${atrasadas.length} tarefa(s) atrasada(s)`) }

    // 2. Dias sem atividade
    const clienteAtividades = atividades.filter(a => a.cliente_id === cliente.id)
    const lastActivity = clienteAtividades.length > 0
        ? Math.max(...clienteAtividades.map(a => new Date(a.created_at).getTime()))
        : new Date(cliente.created_at).getTime()
    const diasSemAtividade = (now - lastActivity) / MS_DAY

    if (diasSemAtividade > 30) { demerits += 35; reasons.push(`Sem atividade há ${Math.floor(diasSemAtividade)} dias`) }
    else if (diasSemAtividade > 7) { demerits += 15; reasons.push(`Sem atividade há ${Math.floor(diasSemAtividade)} dias`) }

    // 3. Contrato próximo do vencimento (data_inicio + 12 meses para fixo)
    if (cliente.data_inicio && cliente.tipo_contrato === 'fixo') {
        const inicio = new Date(cliente.data_inicio).getTime()
        const vencimento = inicio + 365 * MS_DAY
        const diasParaVencer = (vencimento - now) / MS_DAY
        if (diasParaVencer < 0) { demerits += 25; reasons.push('Contrato vencido') }
        else if (diasParaVencer < 30) { demerits += 15; reasons.push(`Contrato vence em ${Math.ceil(diasParaVencer)} dias`) }
    }

    // 4. Status do cliente
    if (cliente.status === 'encerrado') { demerits += 50; reasons.push('Contrato encerrado') }
    else if (cliente.status === 'pausado') { demerits += 20; reasons.push('Contrato pausado') }

    const score = Math.max(0, 100 - demerits)
    const level: HealthLevel = score >= 70 ? 'verde' : score >= 40 ? 'amarelo' : 'vermelho'

    return { level, score, reasons }
}

export const HEALTH_COLOR: Record<HealthLevel, string> = {
    verde: '#10b981',
    amarelo: '#f59e0b',
    vermelho: '#ef4444',
}

export const HEALTH_BG: Record<HealthLevel, string> = {
    verde: '#d1fae5',
    amarelo: '#fef3c7',
    vermelho: '#fee2e2',
}

export const HEALTH_LABEL: Record<HealthLevel, string> = {
    verde: 'Saudável',
    amarelo: 'Atenção',
    vermelho: 'Crítico',
}
