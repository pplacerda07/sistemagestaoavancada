import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const supabase = createServerSupabase()
    const { data } = await supabase.from('configuracoes').select('*').limit(1).single()

    return NextResponse.json(data || { valor_hora: 50 })
}

export async function PATCH(req: NextRequest) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const body = await req.json()
    const supabase = createServerSupabase()

    if (typeof body.valor_hora === 'number' && body.valor_hora > 0) {
        // Find existing to update, or insert new
        const { data: existing } = await supabase.from('configuracoes').select('id').limit(1).single()

        if (existing) {
            await supabase.from('configuracoes').update({ valor_hora: body.valor_hora }).eq('id', existing.id)
        } else {
            await supabase.from('configuracoes').insert([{ valor_hora: body.valor_hora }])
        }
    }

    const { data } = await supabase.from('configuracoes').select('*').limit(1).single()
    return NextResponse.json(data || { valor_hora: 50 })
}
