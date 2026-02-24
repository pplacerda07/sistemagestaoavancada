import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    const { hash } = await params
    const supabase = createServerSupabase()

    const { data: cliente } = await supabase.from('clientes').select('id').eq('portal_hash', hash).eq('portal_ativo', true).single()

    if (!cliente) {
        return NextResponse.json({ error: 'Portal não encontrado ou inativo.' }, { status: 404 })
    }

    try {
        const body = await req.json()
        const mensagem = body.mensagem?.trim()

        if (!mensagem) {
            return NextResponse.json({ error: 'Mensagem inválida.' }, { status: 400 })
        }

        const novaMensagem = {
            cliente_id: cliente.id,
            mensagem,
            lida: false
        }

        const { data, error } = await supabase.from('mensagens_portal').insert([novaMensagem]).select('id').single()

        if (error) throw error;

        return NextResponse.json({ success: true, id: data.id })
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao processar mensagem.' }, { status: 500 })
    }
}
