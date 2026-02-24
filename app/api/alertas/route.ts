import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'
import { calcAlertas } from '@/lib/alertas'

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    try { verifyToken(token) } catch { return NextResponse.json({ error: 'Não autorizado' }, { status: 401 }) }

    const supabase = createServerSupabase()

    // Fetch required data for alerts
    const { data: clientes } = await supabase.from('clientes').select('*')
    const { data: tarefas } = await supabase.from('tarefas').select('*')
    const { data: atividades } = await supabase.from('atividades_cliente').select('*')
    const { data: mensagens } = await supabase.from('mensagens_portal').select('*')

    const alerts = calcAlertas(clientes || [], tarefas || [], atividades || [], mensagens || [])
    return NextResponse.json(alerts)
}
