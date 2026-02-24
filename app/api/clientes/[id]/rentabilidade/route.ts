import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'
import { calcRentabilidade } from '@/lib/rentabilidade'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { id } = await params
    const supabase = createServerSupabase()

    const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).single()
    if (!cliente) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

    const mes = req.nextUrl.searchParams.get('mes') ?? undefined
    const { data: horas } = await supabase.from('horas_cliente').select('*').eq('cliente_id', id)

    const { data: config } = await supabase.from('configuracoes').select('valor_hora').limit(1).single()
    const valorHora = config?.valor_hora || 50

    const result = calcRentabilidade(cliente as any, (horas || []) as any, valorHora, mes)
    return NextResponse.json({ ...result, valorHora })
}
