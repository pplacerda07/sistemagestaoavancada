import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ user: null }, { status: 401 })

    const supabase = createServerSupabase()
    const { data: dbUser, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', payload.id)
        .single()

    if (error || !dbUser) return NextResponse.json({ user: null }, { status: 401 })

    return NextResponse.json({
        user: {
            id: dbUser.id,
            nome: dbUser.nome,
            username: dbUser.username,
            funcao: dbUser.funcao,
            is_admin_matriz: dbUser.is_admin_matriz,
        }
    })
}
