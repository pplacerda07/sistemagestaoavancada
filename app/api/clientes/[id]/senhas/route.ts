import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    return NextResponse.json(store.senhas.filter(s => s.cliente_id === id))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const { titulo, login, senha, url: urlField, notas } = await req.json()
    const nova = { id: uuid(), cliente_id: id, titulo, login: login || '', senha: senha || '', url: urlField || null, notas: notas || null, created_at: now() }
    store.senhas.push(nova)
    return NextResponse.json(nova, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const url = new URL(req.url)
    const senhaId = url.searchParams.get('senha_id')
    if (senhaId) {
        const idx = store.senhas.findIndex(s => s.id === senhaId && s.cliente_id === id)
        if (idx !== -1) store.senhas.splice(idx, 1)
    }
    return NextResponse.json({ ok: true })
}
