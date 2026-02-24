import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const supabase = createServerSupabase()

    const { data: usuarios, error } = await supabase.from('usuarios').select('id, nome, username, funcao, is_admin_matriz, created_at').order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(usuarios || [])
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const { nome, username, senha, funcao, is_admin_matriz } = body

    if (!nome || !username || !senha) return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })

    const supabase = createServerSupabase()

    // Check if username exists
    const { data: existing } = await supabase.from('usuarios').select('id').eq('username', username).single()
    if (existing) {
        return NextResponse.json({ error: 'Username já existe' }, { status: 409 })
    }

    const senha_hash = await bcrypt.hash(senha, 10)

    const novoUsuario = {
        nome,
        username,
        senha_hash,
        funcao: funcao || 'Admin',
        is_admin_matriz: !!is_admin_matriz
    }

    const { data: novo, error } = await supabase.from('usuarios').insert([novoUsuario]).select('id, nome, username, funcao, is_admin_matriz, created_at').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(novo, { status: 201 })
}
