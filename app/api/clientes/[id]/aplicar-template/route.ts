import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store, { uuid, now } from '@/lib/db/store'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

const MS_DAY = 86400_000

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const { template_id } = body

    const cliente = store.clientes.find(c => c.id === id)
    if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

    const template = store.templates.find(t => t.id === template_id)
    if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })

    const tarefasTemplate = store.templates_tarefas.filter(tt => tt.template_id === template_id)

    // Base date: client's start date or today
    const base = cliente.data_inicio
        ? new Date(cliente.data_inicio).getTime()
        : Date.now()

    const criadas = tarefasTemplate.map(tt => {
        const prazoDate = new Date(base + tt.prazo_dias * MS_DAY)
        const prazoStr = prazoDate.toISOString().split('T')[0]
        const tarefa = {
            id: 'tar-' + uuid(),
            titulo: tt.titulo,
            descricao: tt.descricao,
            cliente_id: id,
            usuario_id: user.id,
            status: 'a_fazer' as const,
            prioridade: tt.prioridade,
            prazo: prazoStr,
            created_at: now(),
            recorrencia: null,
            recorrencia_pai_id: null,
        }
        store.tarefas.push(tarefa)
        return tarefa
    })

    return NextResponse.json({ criadas: criadas.length, tarefas: criadas }, { status: 201 })
}
