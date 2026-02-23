import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import store, { DBAtividade, uuid, now } from '@/lib/db/store'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

async function getUser(req: NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    try { return jwt.verify(token, JWT_SECRET) as any } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const atividades = store.atividades
        .filter(a => a.cliente_id === id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    return NextResponse.json(atividades)
}

// Rota para registrar uma nova atividade
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: cliente_id } = await params
    const { tipo, descricao } = await req.json()

    if (!tipo || !descricao) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const atividade: DBAtividade = {
        id: 'atv-' + uuid(),
        cliente_id,
        tipo,
        descricao,
        usuario_id: user.id,
        usuario_nome: user.nome,
        created_at: now(),
    }

    store.atividades.push(atividade)
    return NextResponse.json(atividade, { status: 201 })
}
