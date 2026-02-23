import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store from '@/lib/db/store'
import { calcHealth } from '@/lib/health'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const cliente = store.clientes.find(c => c.id === id)
    if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    const result = calcHealth(cliente, store.tarefas, store.atividades)
    return NextResponse.json(result)
}
