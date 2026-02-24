import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const supabase = createServerSupabase()

    // Total revenue from active clients
    const { data: clientesAtivos } = await supabase.from('clientes').select('valor_mensal').eq('status', 'ativo')
    const receita_total = (clientesAtivos || []).reduce((s, c) => s + Number(c.valor_mensal || 0), 0)

    // Total costs
    const { data: custos } = await supabase.from('custos_operacionais').select('valor')
    const custos_total = (custos || []).reduce((s, c) => s + Number(c.valor || 0), 0)

    return NextResponse.json({
        receita_total,
        custos_total,
        lucro_liquido: receita_total - custos_total,
        clientes_ativos: (clientesAtivos || []).length,
    })
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const supabase = createServerSupabase()

    const novoCusto = {
        descricao: body.descricao,
        valor: Number(body.valor),
        categoria: body.categoria || null,
        data: body.data,
        recorrente: !!body.recorrente
    }

    const { data: novo, error } = await supabase.from('custos_operacionais').insert([novoCusto]).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(novo, { status: 201 })
}
