import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { equipe_id, usuario_id, funcao } = await request.json()
    if (!equipe_id || !usuario_id) return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })

    const usr = store.usuarios.find(u => u.id === usuario_id)
    const membro = { id: uuid(), equipe_id, usuario_id, funcao: funcao || usr?.funcao || null, created_at: now() }
    store.membros_equipe.push(membro)
    return NextResponse.json({ ...membro, usuario: usr ? { id: usr.id, nome: usr.nome, funcao: usr.funcao } : null }, { status: 201 })
}
