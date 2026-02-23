import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store from '@/lib/db/store'
import { calcHealth } from '@/lib/health'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

// Returns health for ALL clients at once: { [clienteId]: HealthResult }
export async function GET(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const result: Record<string, any> = {}
    for (const c of store.clientes) {
        result[c.id] = calcHealth(c, store.tarefas, store.atividades)
    }
    return NextResponse.json(result)
}
