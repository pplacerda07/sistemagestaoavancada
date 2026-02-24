import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServerSupabase()
    const { data } = await supabase.from('atividades_cliente').select('*').eq('cliente_id', id).order('created_at', { ascending: false })

    return NextResponse.json(data || [])
}

// Rota para registrar uma nova atividade
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id: cliente_id } = await params
    const { tipo, descricao } = await req.json()

    if (!tipo || !descricao) {
        return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const atividade = {
        cliente_id,
        tipo,
        descricao,
        usuario_id: user.id,
        usuario_nome: user.nome
    }

    const { data, error } = await supabase.from('atividades_cliente').insert([atividade]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
}
