import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

function enrichTarefa(t: any) {
    const cliente = t.cliente_id ? store.clientes.find(c => c.id === t.cliente_id) : null
    const usuario = t.usuario_id ? store.usuarios.find(u => u.id === t.usuario_id) : null
    return {
        ...t,
        cliente: cliente ? { id: cliente.id, nome: cliente.nome } : null,
        usuario: usuario ? { id: usuario.id, nome: usuario.nome } : null,
    }
}

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    let tarefas = [...store.tarefas].sort((a, b) => b.created_at.localeCompare(a.created_at))

    if (!user.is_admin_matriz) {
        tarefas = tarefas.filter((t) => t.usuario_id === user.id)
    }

    return NextResponse.json(tarefas.map(enrichTarefa))
}

export async function POST(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const body = await request.json()
    const nova: any = {
        id: uuid(),
        titulo: body.titulo,
        descricao: body.descricao || null,
        cliente_id: body.cliente_id || null,
        usuario_id: body.usuario_id || null,
        status: body.status || 'a_fazer',
        prioridade: body.prioridade || 'media',
        prazo: body.prazo || null,
        created_at: now(),
        visivel_portal: body.visivel_portal || false,
    }
    store.tarefas.push(nova)
    return NextResponse.json(enrichTarefa(nova), { status: 201 })
}
