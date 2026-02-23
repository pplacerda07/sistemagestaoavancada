import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const usuarios = store.usuarios
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(({ senha_hash, ...rest }) => rest)
    return NextResponse.json(usuarios)
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await request.json()
    const { nome, username, senha, funcao, is_admin_matriz } = body

    if (!nome || !username || !senha) return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
    if (store.usuarios.find(u => u.username === username)) {
        return NextResponse.json({ error: 'Username já existe' }, { status: 409 })
    }

    const senha_hash = await bcrypt.hash(senha, 10)
    const novo: any = { id: uuid(), nome, username, senha_hash, funcao: funcao || 'Admin', is_admin_matriz: !!is_admin_matriz, created_at: now() }
    store.usuarios.push(novo)
    const { senha_hash: _, ...result } = novo
    return NextResponse.json(result, { status: 201 })
}
