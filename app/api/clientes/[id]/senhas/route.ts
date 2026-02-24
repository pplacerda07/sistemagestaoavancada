import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const supabase = createServerSupabase()
    const { data } = await supabase.from('senhas_cliente').select('*').eq('cliente_id', id).order('created_at', { ascending: false })
    return NextResponse.json(data || [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const { titulo, login, senha, url: urlField, notas } = await req.json()
    const supabase = createServerSupabase()

    const nova_senha = {
        cliente_id: id,
        titulo,
        login: login || '',
        senha: senha || '',
        url: urlField || null,
        notas: notas || null
    }

    const { data: nova, error } = await supabase.from('senhas_cliente').insert([nova_senha]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(nova, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const url = new URL(req.url)
    const senhaId = url.searchParams.get('senha_id')

    if (senhaId) {
        const supabase = createServerSupabase()
        const { error } = await supabase.from('senhas_cliente').delete().eq('id', senhaId).eq('cliente_id', id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
}
