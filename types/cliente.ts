export type TipoContrato = 'fixo' | 'freelance'
export type StatusCliente = 'ativo' | 'pausado' | 'encerrado'

export interface Cliente {
    id: string
    nome: string
    email: string | null
    telefone: string | null
    servico: string | null
    valor_mensal: number | null
    tipo_contrato: TipoContrato
    data_inicio: string | null
    status: StatusCliente
    observacoes: string | null
    portal_hash: string | null
    portal_ativo: boolean
    ultimo_acesso_portal: string | null
    created_at: string
    updated_at: string
    horas_semanais_planejadas: number | null
}

export interface CreateClienteDTO {
    nome: string
    email?: string
    telefone?: string
    servico?: string
    valor_mensal?: number
    tipo_contrato: TipoContrato
    data_inicio?: string
    status: StatusCliente
    observacoes?: string
    portal_ativo?: boolean
    horas_semanais_planejadas?: number
}

export interface UpdateClienteDTO extends Partial<CreateClienteDTO> { }
