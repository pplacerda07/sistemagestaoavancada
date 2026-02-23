export type FuncaoUsuario = 'TI' | 'Marketing' | 'Admin'

export interface Usuario {
    id: string
    nome: string
    username: string
    funcao: FuncaoUsuario
    is_admin_matriz: boolean
    created_at: string
    capacidade_semanal_horas: number
}

export interface CreateUsuarioDTO {
    nome: string
    username: string
    senha: string
    funcao: FuncaoUsuario
    is_admin_matriz?: boolean
    capacidade_semanal_horas?: number
}
