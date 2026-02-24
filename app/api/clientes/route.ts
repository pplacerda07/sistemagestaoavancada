import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const supabase = createServerSupabase()

    // Non-admins: only show clients from their tasks
    if (!user.is_admin_matriz) {
        const { data: tarefas } = await supabase.from('tarefas').select('cliente_id').eq('usuario_id', user.id)
        const clienteIds = Array.from(new Set((tarefas || []).map(t => t.cliente_id).filter(Boolean)))

        if (clienteIds.length === 0) return NextResponse.json([])

        const { data: clientes } = await supabase.from('clientes')
            .select('id, nome, servico, status')
            .in('id', clienteIds)
            .order('created_at', { ascending: false })

        return NextResponse.json(clientes || [])
    }

    const { data: clientes } = await supabase.from('clientes').select('*').order('created_at', { ascending: false })
    return NextResponse.json(clientes || [])
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const supabase = createServerSupabase()

    const novo = {
        nome: body.nome,
        email: body.email || null,
        telefone: body.telefone || null,
        servico: body.servico || null,
        valor_mensal: body.valor_mensal ? Number(body.valor_mensal) : null,
        tipo_contrato: body.tipo_contrato || 'fixo',
        data_inicio: body.data_inicio || null,
        status: body.status || 'ativo',
        observacoes: body.observacoes || null,
    }

    const { data, error } = await supabase.from('clientes').insert([novo]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
}
