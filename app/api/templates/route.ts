import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store, { uuid, now } from '@/lib/db/store'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const templates = store.templates.map(t => ({
        ...t,
        tarefas: store.templates_tarefas.filter(tt => tt.template_id === t.id),
    }))
    return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const body = await req.json()
    if (!body.nome?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

    const template = {
        id: 'tpl-' + uuid(),
        nome: body.nome.trim(),
        descricao: body.descricao || null,
        created_at: now(),
    }
    store.templates.push(template)

    // Create sub-tasks
    const tarefas = (body.tarefas || []).map((t: any, i: number) => ({
        id: 'ttf-' + uuid(),
        template_id: template.id,
        titulo: t.titulo?.trim() || `Tarefa ${i + 1}`,
        descricao: t.descricao || null,
        prazo_dias: parseInt(t.prazo_dias) || 7,
        prioridade: t.prioridade || 'media',
    }))
    store.templates_tarefas.push(...tarefas)

    return NextResponse.json({ ...template, tarefas }, { status: 201 })
}
