import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

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
    const ideias = store.ideias.filter(i => i.usuario_id === user.id && i.status === 'pendente')
    return NextResponse.json(ideias)
}

export async function POST(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { texto } = await req.json()
    if (!texto || !texto.trim()) {
        return NextResponse.json({ error: 'Texto inválido' }, { status: 400 })
    }

    const novaIdeia: any = {
        id: `ideia-${uuid()}`,
        usuario_id: user.id,
        texto: texto.trim(),
        status: 'pendente',
        created_at: now()
    }

    store.ideias.push(novaIdeia)
    return NextResponse.json(novaIdeia, { status: 201 })
}
