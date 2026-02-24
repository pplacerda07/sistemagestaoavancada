import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServerSupabase()

    const { data: ideia } = await supabase.from('ideias').select('*').eq('id', id).single()
    if (!ideia) return NextResponse.json({ error: 'Ideia não encontrada' }, { status: 404 })

    if (ideia.usuario_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { status, texto } = await req.json()
    const updates: any = {}
    if (status) updates.status = status
    if (texto !== undefined) updates.texto = texto

    const { data: updated, error } = await supabase.from('ideias').update(updates).eq('id', id).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServerSupabase()

    const { data: ideia } = await supabase.from('ideias').select('*').eq('id', id).single()
    if (!ideia) return NextResponse.json({ error: 'Ideia não encontrada' }, { status: 404 })

    if (ideia.usuario_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { error } = await supabase.from('ideias').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
