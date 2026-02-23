import { NextRequest, NextResponse } from 'next/server'
import store, { now, uuid } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const cliente = store.clientes.find((c) => c.id === id)
    if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    return NextResponse.json(cliente)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { id } = await params
    const idx = store.clientes.findIndex((c) => c.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

    const body = await request.json()

    let portal_hash = store.clientes[idx].portal_hash
    const portal_ativo = body.portal_ativo ?? store.clientes[idx].portal_ativo
    // Automatically generate a hash if the portal is activated for the first time
    if (portal_ativo && !portal_hash) {
        portal_hash = uuid()
    }

    store.clientes[idx] = {
        ...store.clientes[idx],
        nome: body.nome ?? store.clientes[idx].nome,
        email: body.email ?? store.clientes[idx].email,
        telefone: body.telefone ?? store.clientes[idx].telefone,
        servico: body.servico ?? store.clientes[idx].servico,
        valor_mensal: body.valor_mensal !== undefined ? Number(body.valor_mensal) : store.clientes[idx].valor_mensal,
        tipo_contrato: body.tipo_contrato ?? store.clientes[idx].tipo_contrato,
        data_inicio: body.data_inicio ?? store.clientes[idx].data_inicio,
        status: body.status ?? store.clientes[idx].status,
        observacoes: body.observacoes ?? store.clientes[idx].observacoes,
        portal_ativo,
        portal_hash,
    }
    return NextResponse.json(store.clientes[idx])
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { id } = await params
    const idx = store.clientes.findIndex((c) => c.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    store.clientes.splice(idx, 1)
    return NextResponse.json({ success: true })
}
