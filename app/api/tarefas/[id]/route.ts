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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const idx = store.tarefas.findIndex((t) => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

    const tarefaOriginal = store.tarefas[idx]
    if (!user.is_admin_matriz && tarefaOriginal.usuario_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const statusMudouParaConcluida = body.status === 'concluida' && tarefaOriginal.status !== 'concluida'

    const updatedTarefa = {
        ...tarefaOriginal,
        titulo: body.titulo ?? tarefaOriginal.titulo,
        descricao: body.descricao ?? tarefaOriginal.descricao,
        cliente_id: body.cliente_id !== undefined ? body.cliente_id : tarefaOriginal.cliente_id,
        usuario_id: body.usuario_id !== undefined ? body.usuario_id : tarefaOriginal.usuario_id,
        status: body.status ?? tarefaOriginal.status,
        prioridade: body.prioridade ?? tarefaOriginal.prioridade,
        prazo: body.prazo !== undefined ? body.prazo : tarefaOriginal.prazo,
        recorrencia: body.recorrencia !== undefined ? body.recorrencia : tarefaOriginal.recorrencia,
        visivel_portal: body.visivel_portal !== undefined ? body.visivel_portal : tarefaOriginal.visivel_portal,
    }

    store.tarefas[idx] = updatedTarefa

    // Logica de Recorrência
    if (statusMudouParaConcluida && updatedTarefa.recorrencia && updatedTarefa.recorrencia !== 'nenhuma') {
        const dataReferencia = updatedTarefa.prazo ? new Date(updatedTarefa.prazo) : new Date()
        const novaData = new Date(dataReferencia)

        if (updatedTarefa.recorrencia === 'semanal') novaData.setDate(novaData.getDate() + 7)
        else if (updatedTarefa.recorrencia === 'quinzenal') novaData.setDate(novaData.getDate() + 15)
        else if (updatedTarefa.recorrencia === 'mensal') novaData.setMonth(novaData.getMonth() + 1)

        const novaTarefa = {
            id: 'tar-' + uuid(),
            titulo: updatedTarefa.titulo,
            descricao: updatedTarefa.descricao,
            cliente_id: updatedTarefa.cliente_id,
            usuario_id: updatedTarefa.usuario_id,
            status: 'a_fazer' as const,
            prioridade: updatedTarefa.prioridade,
            prazo: novaData.toISOString().split('T')[0],
            created_at: now(),
            recorrencia: updatedTarefa.recorrencia,
            recorrencia_pai_id: updatedTarefa.id,
            visivel_portal: updatedTarefa.visivel_portal,
        }
        store.tarefas.push(novaTarefa)
    }

    return NextResponse.json(enrichTarefa(store.tarefas[idx]))
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const idx = store.tarefas.findIndex((t) => t.id === params.id)
    if (idx === -1) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })
    store.tarefas.splice(idx, 1)
    return NextResponse.json({ success: true })
}
