import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'
import { calcHealth } from '@/lib/health'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServerSupabase()

    const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).single()
    if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const { data: tarefas } = await supabase.from('tarefas').select('*').eq('cliente_id', id)
    const { data: atividades } = await supabase.from('atividades_cliente').select('*').eq('cliente_id', id)

    const result = calcHealth(cliente as any, (tarefas || []) as any, (atividades || []) as any)
    return NextResponse.json(result)
}
