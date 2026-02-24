import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ hash: string, arquivo_id: string }> }) {
    const { hash, arquivo_id } = await params
    const supabase = createServerSupabase()

    const { data: cliente } = await supabase.from('clientes').select('id').eq('portal_hash', hash).eq('portal_ativo', true).single()
    if (!cliente) {
        return NextResponse.json({ error: 'Portal não encontrado ou inativo.' }, { status: 404 })
    }

    const { data: arquivo } = await supabase.from('anexos_cliente').select('*').eq('id', arquivo_id).eq('cliente_id', cliente.id).eq('visivel_portal', true).single()

    if (!arquivo || !arquivo.dados_base64) {
        return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 })
    }

    // Parse base64 header
    let base64Data = arquivo.dados_base64
    if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1]
    }

    const buffer = Buffer.from(base64Data, 'base64')

    return new NextResponse(buffer, {
        headers: {
            'Content-Type': arquivo.tipo_conteudo || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(arquivo.nome_arquivo)}"`
        }
    })
}
