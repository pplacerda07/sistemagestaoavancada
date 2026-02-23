import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const idx = store.ideias.findIndex(i => i.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Ideia não encontrada' }, { status: 404 })

    const ideia = store.ideias[idx]
    if (ideia.usuario_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { status, texto } = await req.json()
    store.ideias[idx] = {
        ...ideia,
        status: status || ideia.status,
        texto: texto !== undefined ? texto : ideia.texto
    }

    return NextResponse.json(store.ideias[idx])
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const idx = store.ideias.findIndex(i => i.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Ideia não encontrada' }, { status: 404 })

    if (store.ideias[idx].usuario_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    store.ideias.splice(idx, 1)
    return NextResponse.json({ success: true })
}
