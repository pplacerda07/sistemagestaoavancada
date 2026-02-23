import { FuncaoUsuario } from './usuario'

export interface Equipe {
    id: string
    nome: string
    descricao: string | null
    criador_id: string | null
    created_at: string
    // Joined
    criador?: { id: string; nome: string }
    membros?: MembroEquipe[]
}

export interface MembroEquipe {
    id: string
    equipe_id: string
    usuario_id: string
    funcao: FuncaoUsuario | null
    created_at: string
    usuario?: { id: string; nome: string; funcao: FuncaoUsuario }
}

export interface CreateEquipeDTO {
    nome: string
    descricao?: string
}

export interface AddMembroDTO {
    equipe_id: string
    usuario_id: string
    funcao?: FuncaoUsuario
}
