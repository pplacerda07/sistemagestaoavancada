import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const supabase = createServerSupabase()

    let query = supabase.from('tarefas').select(`
        *,
        cliente:clientes(id, nome),
        usuario:usuarios(id, nome)
    `).order('created_at', { ascending: false })

    if (!user.is_admin_matriz) {
        query = query.eq('usuario_id', user.id)
    }

    const { data: tarefas, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // If an object is an array just take the first item, Supabase might return array for 1:N but we know it's N:1
    const enriched = (tarefas || []).map(t => ({
        ...t,
        cliente: Array.isArray(t.cliente) ? t.cliente[0] : t.cliente,
        usuario: Array.isArray(t.usuario) ? t.usuario[0] : t.usuario
    }))

    return NextResponse.json(enriched)
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const supabase = createServerSupabase()

    const novaTarefa = {
        titulo: body.titulo,
        descricao: body.descricao || null,
        cliente_id: body.cliente_id || null,
        usuario_id: body.usuario_id || null,
        status: body.status || 'a_fazer',
        prioridade: body.prioridade || 'media',
        prazo: body.prazo || null,
        visivel_portal: body.visivel_portal || false,
    }

    const { data: inserted, error } = await supabase.from('tarefas').insert([novaTarefa]).select(`
        *,
        cliente:clientes(id, nome),
        usuario:usuarios(id, nome)
    `).single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const enriched = {
        ...inserted,
        cliente: Array.isArray(inserted.cliente) ? inserted.cliente[0] : inserted.cliente,
        usuario: Array.isArray(inserted.usuario) ? inserted.usuario[0] : inserted.usuario
    }

    return NextResponse.json(enriched, { status: 201 })
}
