import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    try { verifyToken(token) } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }) }
    return NextResponse.json(store.historico_financeiro)
}
