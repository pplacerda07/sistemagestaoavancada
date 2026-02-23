import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store from '@/lib/db/store'
import { calcRentabilidade } from '@/lib/rentabilidade'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const cliente = store.clientes.find(c => c.id === id)
    if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    const mes = req.nextUrl.searchParams.get('mes') ?? undefined
    const result = calcRentabilidade(cliente, store.horas, store.config.valor_hora, mes)
    return NextResponse.json({ ...result, valorHora: store.config.valor_hora })
}
