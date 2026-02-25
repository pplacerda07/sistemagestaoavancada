export type StatusTarefa = 'a_fazer' | 'em_andamento' | 'concluida'
export type PrioridadeTarefa = 'baixa' | 'media' | 'alta'

export interface Tarefa {
    id: string
    titulo: string
    descricao: string | null
    cliente_id: string | null
    usuario_id: string | null
    equipe_id: string | null
    status: StatusTarefa
    prioridade: PrioridadeTarefa
    prazo: string | null
    visivel_portal: boolean
    created_at: string
    updated_at: string
    // Joined fields
    cliente?: { id: string; nome: string }
    usuario?: { id: string; nome: string }
    equipe?: { id: string; nome: string }
}

export interface CreateTarefaDTO {
    titulo: string
    descricao?: string
    cliente_id?: string
    usuario_id?: string
    equipe_id?: string
    status: StatusTarefa
    prioridade: PrioridadeTarefa
    prazo?: string
    visivel_portal?: boolean
}

export interface UpdateTarefaDTO extends Partial<CreateTarefaDTO> { }
