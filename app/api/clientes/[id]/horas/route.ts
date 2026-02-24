import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const supabase = createServerSupabase()
    const { data } = await supabase.from('horas_cliente').select('*').eq('cliente_id', id).order('data', { ascending: false })
    return NextResponse.json(data || [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const body = await req.json()

    if (!body.descricao || !body.horas || !body.data) {
        return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    const supabase = createServerSupabase()
    const hora = {
        cliente_id: id,
        descricao: body.descricao,
        horas: parseFloat(body.horas),
        data: body.data,
        tarefa_id: body.tarefa_id || null,
    }

    const { data, error } = await supabase.from('horas_cliente').insert([hora]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const horaId = req.nextUrl.searchParams.get('hora_id')

    if (!horaId) return NextResponse.json({ error: 'hora_id obrigatório' }, { status: 400 })

    const supabase = createServerSupabase()
    const { error } = await supabase.from('horas_cliente').delete().eq('id', horaId).eq('cliente_id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
}
