import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store from '@/lib/db/store'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ user: null }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ user: null }, { status: 401 })

    // Return fresh user data from store (in case it was updated)
    const dbUser = store.usuarios.find(u => u.id === payload.id)
    if (!dbUser) return NextResponse.json({ user: null }, { status: 401 })

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
