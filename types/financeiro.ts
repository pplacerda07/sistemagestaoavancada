export interface CustoOperacional {
    id: string
    descricao: string
    valor: number
    categoria: string | null
    data: string
    recorrente: boolean
    created_at: string
}

export interface CreateCustoDTO {
    descricao: string
    valor: number
    categoria?: string
    data: string
    recorrente: boolean
}

export interface ResumoFinanceiro {
    receita_total: number
    custos_total: number
    lucro_liquido: number
    clientes_ativos: number
    receita_por_mes: { mes: string; valor: number }[]
}
