import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import store, { uuid, now } from '@/lib/db/store'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params
    const template = store.templates.find(t => t.id === id)
    if (!template) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    return NextResponse.json({ ...template, tarefas: store.templates_tarefas.filter(tt => tt.template_id === id) })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const idx = store.templates.findIndex(t => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    const body = await req.json()

    // Update template header
    if (body.nome) store.templates[idx].nome = body.nome.trim()
    if ('descricao' in body) store.templates[idx].descricao = body.descricao || null

    // Replace tasks if provided
    if (Array.isArray(body.tarefas)) {
        // Remove old tasks
        store.templates_tarefas = store.templates_tarefas.filter(tt => tt.template_id !== id)
        // Add updated tasks
        const novas = body.tarefas.map((t: any, i: number) => ({
            id: 'ttf-' + uuid(),
            template_id: id,
            titulo: t.titulo?.trim() || `Tarefa ${i + 1}`,
            descricao: t.descricao || null,
            prazo_dias: parseInt(t.prazo_dias) || 7,
            prioridade: t.prioridade || 'media',
        }))
        store.templates_tarefas.push(...novas)
    }

    return NextResponse.json({ ...store.templates[idx], tarefas: store.templates_tarefas.filter(tt => tt.template_id === id) })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const idx = store.templates.findIndex(t => t.id === id)
    if (idx === -1) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
    store.templates.splice(idx, 1)
    store.templates_tarefas = store.templates_tarefas.filter(tt => tt.template_id !== id)
    return NextResponse.json({ ok: true })
}
