import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

function enrichEquipe(eq: any) {
    const criador = eq.criador_id ? store.usuarios.find(u => u.id === eq.criador_id) : null
    const membros = store.membros_equipe
        .filter(m => m.equipe_id === eq.id)
        .map(m => {
            const usr = store.usuarios.find(u => u.id === m.usuario_id)
            return { ...m, usuario: usr ? { id: usr.id, nome: usr.nome, funcao: usr.funcao } : null }
        })
    return { ...eq, criador: criador ? { id: criador.id, nome: criador.nome } : null, membros }
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const equipes = [...store.equipes]
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(enrichEquipe)
    return NextResponse.json(equipes)
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const nova: any = { id: uuid(), nome: body.nome, descricao: body.descricao || null, criador_id: user.id, created_at: now() }
    store.equipes.push(nova)
    // Auto-add creator as member
    store.membros_equipe.push({ id: uuid(), equipe_id: nova.id, usuario_id: user.id, funcao: user.funcao, created_at: now() })
    return NextResponse.json(enrichEquipe(nova), { status: 201 })
}
