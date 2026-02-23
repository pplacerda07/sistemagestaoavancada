import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const clientesAtivos = store.clientes.filter(c => c.status === 'ativo')
    const receita_total = clientesAtivos.reduce((s, c) => s + (c.valor_mensal || 0), 0)
    const custos_total = store.custos.reduce((s, c) => s + c.valor, 0)

    return NextResponse.json({
        receita_total,
        custos_total,
        lucro_liquido: receita_total - custos_total,
        clientes_ativos: clientesAtivos.length,
    })
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const novo: any = {
        id: uuid(),
        descricao: body.descricao,
        valor: Number(body.valor),
        categoria: body.categoria || null,
        data: body.data,
        recorrente: !!body.recorrente,
        created_at: now(),
    }
    store.custos.push(novo)
    return NextResponse.json(novo, { status: 201 })
}
