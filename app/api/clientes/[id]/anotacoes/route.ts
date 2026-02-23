import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now, DBAtividade } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

function registrar(cliente_id: string, tipo: string, descricao: string, user: any) {
    store.atividades.push({
        id: 'atv-' + uuid(), cliente_id, tipo, descricao,
        usuario_id: user.id, usuario_nome: user.nome, created_at: now(),
    } as DBAtividade)
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const anotacoes = store.anotacoes.filter(a => a.cliente_id === id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
    return NextResponse.json(anotacoes)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const { titulo, conteudo } = await req.json()
    const nova = { id: uuid(), cliente_id: id, titulo: titulo || 'Sem título', conteudo: conteudo || '', usuario_id: user.id, created_at: now(), updated_at: now() }
    store.anotacoes.push(nova)
    registrar(id, 'anotacao_criada', `Anotação adicionada: ${nova.titulo}`, user)
    return NextResponse.json(nova, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const url = new URL(req.url)
    const anotacaoId = url.searchParams.get('anotacao_id')
    if (anotacaoId) {
        const idx = store.anotacoes.findIndex(a => a.id === anotacaoId && a.cliente_id === id)
        if (idx !== -1) {
            const titulo = store.anotacoes[idx].titulo
            store.anotacoes.splice(idx, 1)
            registrar(id, 'anotacao_removida', `Anotação removida: ${titulo}`, user)
        }
    }
    return NextResponse.json({ ok: true })
}
