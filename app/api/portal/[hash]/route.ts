import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    const { hash } = await params
    const supabase = createServerSupabase()

    const { data: cliente, error } = await supabase.from('clientes').select('id, nome, servico, status').eq('portal_hash', hash).eq('portal_ativo', true).single()

    if (error || !cliente) {
        return NextResponse.json({ error: 'Portal não encontrado ou inativo.' }, { status: 404 })
    }

    // Refresh last access asynchronously (don't block response)
    supabase.from('clientes').update({ ultimo_acesso_portal: new Date().toISOString() }).eq('id', cliente.id).then()

    // Fetch permitted data
    const { data: tarefas } = await supabase.from('tarefas').select('titulo, descricao, status').eq('cliente_id', cliente.id).eq('visivel_portal', true)

    const { data: arquivos } = await supabase.from('anexos_cliente').select('id, nome_arquivo, tamanho_bytes, dados_base64').eq('cliente_id', cliente.id).eq('visivel_portal', true)

    const formattedArquivos = (arquivos || []).map(a => ({
        id: a.id,
        nome: a.nome_arquivo,
        tamanho: a.tamanho_bytes,
        url: a.dados_base64 ? 'Disponível para download' : null
    }))

    return NextResponse.json({
        cliente: {
            nome: cliente.nome,
            servico: cliente.servico,
            status: cliente.status
        },
        tarefas: tarefas || [],
        arquivos: formattedArquivos
    })
}
