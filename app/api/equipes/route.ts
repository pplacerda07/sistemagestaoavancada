import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const supabase = createServerSupabase()

    // Buscar equipes com o criador e os membros (incluindo usuários dos membros)
    const { data: equipes, error } = await supabase.from('equipes').select(`
        *,
        criador:usuarios!equipes_criador_id_fkey(id, nome),
        membros_equipe(
            id, equipe_id, usuario_id, funcao, created_at,
            usuario:usuarios!membros_equipe_usuario_id_fkey(id, nome, funcao)
        )
    `).order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const enriched = (equipes || []).map(eq => ({
        ...eq,
        criador: Array.isArray(eq.criador) ? eq.criador[0] : eq.criador,
        membros: (eq.membros_equipe || []).map((m: any) => ({
            ...m,
            usuario: Array.isArray(m.usuario) ? m.usuario[0] : m.usuario
        }))
    }))

    return NextResponse.json(enriched)
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const supabase = createServerSupabase()

    const novaEquipe = {
        nome: body.nome,
        descricao: body.descricao || null,
        criador_id: user.id
    }

    const { data: inserted, error } = await supabase.from('equipes').insert([novaEquipe]).select(`
        *,
        criador:usuarios!equipes_criador_id_fkey(id, nome)
    `).single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Auto-add creator as member
    const { data: creatorMember, error: memberError } = await supabase.from('membros_equipe').insert([{
        equipe_id: inserted.id,
        usuario_id: user.id,
        funcao: user.funcao
    }]).select(`
        id, equipe_id, usuario_id, funcao, created_at,
        usuario:usuarios!membros_equipe_usuario_id_fkey(id, nome, funcao)
    `).single()

    const enriched = {
        ...inserted,
        criador: Array.isArray(inserted.criador) ? inserted.criador[0] : inserted.criador,
        membros: creatorMember ? [{
            ...creatorMember,
            usuario: Array.isArray(creatorMember.usuario) ? creatorMember.usuario[0] : creatorMember.usuario
        }] : []
    }

    return NextResponse.json(enriched, { status: 201 })
}
