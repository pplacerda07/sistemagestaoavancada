import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

function getUser(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null
    try { return verifyToken(token) } catch { return null }
}

export async function GET(req: NextRequest) {
    const user = getUser(req)
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const supabase = createServerSupabase()
    const { data: templates } = await supabase.from('templates').select(`
        *,
        tarefas:templates_tarefas(*)
    `).order('created_at', { ascending: false })

    return NextResponse.json(templates || [])
}

export async function POST(req: NextRequest) {
    const user = getUser(req)
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const body = await req.json()
    if (!body.nome?.trim()) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 })

    const supabase = createServerSupabase()

    const novoTemplate = {
        nome: body.nome.trim(),
        descricao: body.descricao || null
    }

    const { data: template, error: tmplError } = await supabase.from('templates').insert([novoTemplate]).select('*').single()

    if (tmplError || !template) return NextResponse.json({ error: tmplError?.message }, { status: 500 })

    // Create sub-tasks
    let tarefas: any[] = []
    if (body.tarefas && body.tarefas.length > 0) {
        const payload = body.tarefas.map((t: any, i: number) => ({
            template_id: template.id,
            titulo: t.titulo?.trim() || `Tarefa ${i + 1}`,
            descricao: t.descricao || null,
            prazo_dias: parseInt(t.prazo_dias) || 7,
            prioridade: t.prioridade || 'media',
        }))
        const { data: insertTarefas } = await supabase.from('templates_tarefas').insert(payload).select('*')
        if (insertTarefas) tarefas = insertTarefas
    }

    return NextResponse.json({ ...template, tarefas }, { status: 201 })
}
