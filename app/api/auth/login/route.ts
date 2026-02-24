import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createServerSupabase } from '@/lib/supabase/server'
import { signToken } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
    try {
        const { username, senha } = await request.json()

        if (!username || !senha) {
            return NextResponse.json({ error: 'Usuário e senha são obrigatórios' }, { status: 400 })
        }

        const supabase = createServerSupabase()
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('username', username)
            .single()

        if (error || !user) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
        }

        const senhaValida = await bcrypt.compare(senha, user.senha_hash)
        if (!senhaValida) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })
        }

        const token = signToken({
            id: user.id,
            username: user.username,
            nome: user.nome,
            funcao: user.funcao,
            is_admin_matriz: user.is_admin_matriz,
        })

        const response = NextResponse.json({
            user: { id: user.id, nome: user.nome, username: user.username, funcao: user.funcao, is_admin_matriz: user.is_admin_matriz },
        })

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })

        return response
    } catch (err) {
        console.error('Login error:', err)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
