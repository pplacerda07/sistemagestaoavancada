import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    let clientes = [...store.clientes].sort((a, b) => b.created_at.localeCompare(a.created_at))

    // Non-admins: only show clients from their tasks
    if (!user.is_admin_matriz) {
        const clienteIds = new Set(
            store.tarefas.filter((t) => t.usuario_id === user.id && t.cliente_id).map((t) => t.cliente_id!)
        )
        clientes = clientes.filter((c) => clienteIds.has(c.id))
        // Strip financial info
        return NextResponse.json(clientes.map(c => ({ id: c.id, nome: c.nome, servico: c.servico, status: c.status })))
    }

    return NextResponse.json(clientes)
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const novo: any = {
        id: uuid(),
        nome: body.nome,
        email: body.email || null,
        telefone: body.telefone || null,
        servico: body.servico || null,
        valor_mensal: body.valor_mensal ? Number(body.valor_mensal) : null,
        tipo_contrato: body.tipo_contrato || 'fixo',
        data_inicio: body.data_inicio || null,
        status: body.status || 'ativo',
        observacoes: body.observacoes || null,
        created_at: now(),
    }
    store.clientes.push(novo)
    return NextResponse.json(novo, { status: 201 })
}
