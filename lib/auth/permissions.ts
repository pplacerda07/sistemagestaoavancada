import { JWTPayload } from './jwt'

export const PERMISSIONS = {
    ADMIN_MATRIZ: {
        verFinanceiro: true,
        criarUsuarios: true,
        adicionarMembrosEquipe: true,
        verTodosClientes: true,
        verTodasTarefas: true,
        criarTarefas: true,
        delegarTarefas: true,
        criarEquipes: true,
    },
    ADMIN_EQUIPE: {
        verFinanceiro: false,
        criarUsuarios: false,
        adicionarMembrosEquipe: false,
        verTodosClientes: false,
        verTodasTarefas: false,
        criarTarefas: true,
        delegarTarefas: true,
        criarEquipes: true,
    },
    USUARIO_COMUM: {
        verFinanceiro: false,
        criarUsuarios: false,
        adicionarMembrosEquipe: false,
        verTodosClientes: false,
        verTodasTarefas: false,
        criarTarefas: false,
        delegarTarefas: false,
        criarEquipes: true,
    },
}

type PermissionKey = keyof typeof PERMISSIONS.ADMIN_MATRIZ

export function getUserRole(user: JWTPayload): 'ADMIN_MATRIZ' | 'ADMIN_EQUIPE' | 'USUARIO_COMUM' {
    if (user.is_admin_matriz) return 'ADMIN_MATRIZ'
    // Note: ADMIN_EQUIPE is determined dynamically based on team membership
    return 'USUARIO_COMUM'
}

export function hasPermission(user: JWTPayload, permission: PermissionKey): boolean {
    const role = getUserRole(user)
    return PERMISSIONS[role][permission]
}
