import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    try { verifyToken(token) } catch { return NextResponse.json({ error: 'Token inválido' }, { status: 401 }) }

    const supabase = createServerSupabase()
    const { data: historico, error } = await supabase.from('historico_financeiro').select('*').order('mes', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(historico || [])
}
