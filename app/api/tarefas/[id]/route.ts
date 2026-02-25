import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServerSupabase()

    // Buscar a tarefa original
    const { data: tarefaOriginal, error: fetchError } = await supabase.from('tarefas').select('*').eq('id', id).single()
    if (fetchError || !tarefaOriginal) return NextResponse.json({ error: 'Tarefa não encontrada' }, { status: 404 })

    if (!user.is_admin_matriz && tarefaOriginal.usuario_id !== user.id) {
        return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const statusMudouParaConcluida = body.status === 'concluida' && tarefaOriginal.status !== 'concluida'

    const updateData: any = {}
    if (body.titulo !== undefined) updateData.titulo = body.titulo
    if (body.descricao !== undefined) updateData.descricao = body.descricao || null
    if (body.cliente_id !== undefined) updateData.cliente_id = body.cliente_id || null
    if (body.usuario_id !== undefined) updateData.usuario_id = body.usuario_id || null
    if (body.equipe_id !== undefined) updateData.equipe_id = body.equipe_id || null
    if (body.status !== undefined) updateData.status = body.status
    if (body.prioridade !== undefined) updateData.prioridade = body.prioridade
    if (body.prazo !== undefined) updateData.prazo = body.prazo || null
    if (body.recorrencia !== undefined) updateData.recorrencia = body.recorrencia
    if (body.visivel_portal !== undefined) updateData.visivel_portal = body.visivel_portal

    const { data: updatedTarefa, error: updateError } = await supabase.from('tarefas').update(updateData).eq('id', id).select(`
        *,
        cliente:clientes(id, nome),
        usuario:usuarios(id, nome),
        equipe:equipes(id, nome)
    `).single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

    // Logica de Recorrência
    if (statusMudouParaConcluida && updatedTarefa.recorrencia && updatedTarefa.recorrencia !== 'nenhuma') {
        const dataReferencia = updatedTarefa.prazo ? new Date(updatedTarefa.prazo) : new Date()
        const novaData = new Date(dataReferencia)

        if (updatedTarefa.recorrencia === 'semanal') novaData.setDate(novaData.getDate() + 7)
        else if (updatedTarefa.recorrencia === 'quinzenal') novaData.setDate(novaData.getDate() + 15)
        else if (updatedTarefa.recorrencia === 'mensal') novaData.setMonth(novaData.getMonth() + 1)

        const novaTarefa = {
            titulo: updatedTarefa.titulo,
            descricao: updatedTarefa.descricao,
            cliente_id: updatedTarefa.cliente_id,
            usuario_id: updatedTarefa.usuario_id,
            equipe_id: updatedTarefa.equipe_id,
            status: 'a_fazer' as const,
            prioridade: updatedTarefa.prioridade,
            prazo: novaData.toISOString().split('T')[0],
            recorrencia: updatedTarefa.recorrencia,
            recorrencia_pai_id: updatedTarefa.id,
            visivel_portal: updatedTarefa.visivel_portal,
        }
        await supabase.from('tarefas').insert([novaTarefa])
    }

    const enriched = {
        ...updatedTarefa,
        cliente: Array.isArray(updatedTarefa.cliente) ? updatedTarefa.cliente[0] : updatedTarefa.cliente,
        usuario: Array.isArray(updatedTarefa.usuario) ? updatedTarefa.usuario[0] : updatedTarefa.usuario,
        equipe: Array.isArray(updatedTarefa.equipe) ? updatedTarefa.equipe[0] : updatedTarefa.equipe
    }

    return NextResponse.json(enriched)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { id } = await params
    const supabase = createServerSupabase()

    const { error } = await supabase.from('tarefas').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
