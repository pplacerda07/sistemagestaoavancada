import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try {
        return verifyToken(token)
    } catch {
        return null
    }
}

export async function GET(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    // Retorna ideias pendentes do usuário atual
    const supabase = createServerSupabase()
    const { data: ideias } = await supabase.from('ideias').select('*').eq('usuario_id', user.id).eq('status', 'pendente');

    return NextResponse.json(ideias || [])
}

export async function POST(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { texto } = await req.json()
    if (!texto || !texto.trim()) {
        return NextResponse.json({ error: 'Texto inválido' }, { status: 400 })
    }

    const novaIdeia = {
        usuario_id: user.id,
        texto: texto.trim(),
        status: 'pendente'
    }

    const supabase = createServerSupabase()
    const { data: inserted, error } = await supabase.from('ideias').insert([novaIdeia]).select('*').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(inserted, { status: 201 })
}
