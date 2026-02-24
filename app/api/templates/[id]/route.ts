import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    const { id } = await params

    const supabase = createServerSupabase()
    const { data: template } = await supabase.from('templates').select(`
        *,
        tarefas:templates_tarefas(*)
    `).eq('id', id).single()

    if (!template) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    return NextResponse.json(template)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params

    const supabase = createServerSupabase()
    const { data: existing } = await supabase.from('templates').select('*').eq('id', id).single()
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const body = await req.json()

    // Update template header
    const updates: any = {}
    if (body.nome) updates.nome = body.nome.trim()
    if ('descricao' in body) updates.descricao = body.descricao || null

    if (Object.keys(updates).length > 0) {
        await supabase.from('templates').update(updates).eq('id', id)
    }

    // Replace tasks if provided
    if (Array.isArray(body.tarefas)) {
        // Remove old tasks
        await supabase.from('templates_tarefas').delete().eq('template_id', id)

        // Add updated tasks
        if (body.tarefas.length > 0) {
            const novas = body.tarefas.map((t: any, i: number) => ({
                template_id: id,
                titulo: t.titulo?.trim() || `Tarefa ${i + 1}`,
                descricao: t.descricao || null,
                prazo_dias: parseInt(t.prazo_dias) || 7,
                prioridade: t.prioridade || 'media',
            }))
            await supabase.from('templates_tarefas').insert(novas)
        }
    }

    const { data: updatedTemplate } = await supabase.from('templates').select(`
        *,
        tarefas:templates_tarefas(*)
    `).eq('id', id).single()

    return NextResponse.json(updatedTemplate)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params

    const supabase = createServerSupabase()
    const { data: existing } = await supabase.from('templates').select('*').eq('id', id).single()
    if (!existing) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    await supabase.from('templates').delete().eq('id', id)

    return NextResponse.json({ ok: true })
}
