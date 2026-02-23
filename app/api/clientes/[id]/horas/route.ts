import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import store, { DBHora, uuid, now } from '@/lib/db/store'

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
    const horas = store.horas
        .filter(h => h.cliente_id === id)
        .sort((a, b) => b.data.localeCompare(a.data))
    return NextResponse.json(horas)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const body = await req.json()
    if (!body.descricao || !body.horas || !body.data) {
        return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }
    const hora: DBHora = {
        id: 'hor-' + uuid(),
        cliente_id: id,
        descricao: body.descricao,
        horas: parseFloat(body.horas),
        data: body.data,
        tarefa_id: body.tarefa_id || null,
        created_at: now(),
    }
    store.horas.push(hora)
    return NextResponse.json(hora, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const horaId = req.nextUrl.searchParams.get('hora_id')
    if (!horaId) return NextResponse.json({ error: 'hora_id obrigatório' }, { status: 400 })
    const idx = store.horas.findIndex(h => h.id === horaId && h.cliente_id === id)
    if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    store.horas.splice(idx, 1)
    return NextResponse.json({ ok: true })
}
