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
    return NextResponse.json(store.arquivos.filter(a => a.cliente_id === id))
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const { nome, tamanho, tipo, dados_base64 } = await req.json()
    const novo = { id: uuid(), cliente_id: id, nome, tamanho: tamanho || 0, tipo: tipo || 'application/octet-stream', dados_base64: dados_base64 || null, created_at: now(), visivel_portal: false }
    store.arquivos.push(novo)
    registrar(id, 'arquivo_enviado', `Arquivo enviado: ${nome}`, user)
    return NextResponse.json(novo, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const url = new URL(req.url)
    const arquivoId = url.searchParams.get('arquivo_id')
    if (arquivoId) {
        const idx = store.arquivos.findIndex(a => a.id === arquivoId && a.cliente_id === id)
        if (idx !== -1) {
            const nome = store.arquivos[idx].nome
            store.arquivos.splice(idx, 1)
            registrar(id, 'arquivo_removido', `Arquivo removido: ${nome}`, user)
        }
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const arquivoId = body.arquivo_id
    if (!arquivoId) return NextResponse.json({ error: 'ID do arquivo obrigatório' }, { status: 400 })

    const idx = store.arquivos.findIndex(a => a.id === arquivoId && a.cliente_id === id)
    if (idx !== -1) {
        if (body.visivel_portal !== undefined) {
            store.arquivos[idx].visivel_portal = body.visivel_portal
        }
        return NextResponse.json(store.arquivos[idx])
    }
    return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })
}
