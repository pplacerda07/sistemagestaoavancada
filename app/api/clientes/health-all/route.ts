import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'
import { calcHealth } from '@/lib/health'

// Returns health for ALL clients at once: { [clienteId]: HealthResult }
export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const supabase = createServerSupabase()

    let clienteIds: string[] = []

    if (user.is_admin_matriz) {
        const { data: clientes } = await supabase.from('clientes').select('id')
        clienteIds = (clientes || []).map(c => c.id)
    } else {
        const { data: tarefasUsuario } = await supabase.from('tarefas').select('cliente_id').eq('usuario_id', user.id)
        clienteIds = Array.from(new Set((tarefasUsuario || []).map(t => t.cliente_id).filter(Boolean)))
    }

    if (clienteIds.length === 0) return NextResponse.json({})

    const result: Record<string, any> = {}

    const { data: clientesData } = await supabase.from('clientes').select('*').in('id', clienteIds)
    const { data: tarefasData } = await supabase.from('tarefas').select('*').in('cliente_id', clienteIds)
    const { data: atividadesData } = await supabase.from('atividades_cliente').select('*').in('cliente_id', clienteIds)

    for (const c of (clientesData || [])) {
        const cTarefas = (tarefasData || []).filter(t => t.cliente_id === c.id)
        const cAtivs = (atividadesData || []).filter(a => a.cliente_id === c.id)
        result[c.id] = calcHealth(c as any, cTarefas as any, cAtivs as any)
    }

    return NextResponse.json(result)
}
