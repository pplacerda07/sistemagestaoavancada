import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store from '@/lib/db/store'
import { calcAlertas } from '@/lib/alertas'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const alerts = calcAlertas(store.clientes, store.tarefas, store.atividades, store.mensagens_portal)
    return NextResponse.json(alerts)
}
