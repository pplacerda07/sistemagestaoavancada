import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { equipe_id, usuario_id, funcao } = await request.json()
    if (!equipe_id || !usuario_id) return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })

    const supabase = createServerSupabase()

    const { data: usr } = await supabase.from('usuarios').select('id, nome, funcao').eq('id', usuario_id).single()

    const novoMembro = {
        equipe_id,
        usuario_id,
        funcao: funcao || usr?.funcao || null
    }

    const { data: membro, error } = await supabase.from('membros_equipe').insert([novoMembro]).select(`
        id, equipe_id, usuario_id, funcao, created_at,
        usuario:usuarios!membros_equipe_usuario_id_fkey(id, nome, funcao)
    `).single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
        ...membro,
        usuario: Array.isArray(membro.usuario) ? membro.usuario[0] : membro.usuario
    }, { status: 201 })
}
