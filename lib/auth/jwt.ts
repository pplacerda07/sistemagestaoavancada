import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'crm_fiora_super_secret_jwt_key_2024_production_ready'

export interface JWTPayload {
    id: string
    username: string
    nome: string
    funcao: 'TI' | 'Marketing' | 'Admin'
    is_admin_matriz: boolean
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch {
        return null
    }
}
