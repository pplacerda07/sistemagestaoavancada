import { NextRequest, NextResponse } from 'next/server'
import store, { now } from '@/lib/db/store'

export async function GET(req: NextRequest, { params }: { params: { hash: string } }) {
    const hash = params.hash

    const cliente = store.clientes.find(c => c.portal_hash === hash && c.portal_ativo)

    if (!cliente) {
        return NextResponse.json({ error: 'Portal não encontrado ou inativo.' }, { status: 404 })
    }

    // Refresh last access asynchronously (don't block response)
    cliente.ultimo_acesso_portal = now()

    // Fetch permitted data
    const tarefas = store.tarefas.filter(t => t.cliente_id === cliente.id && t.visivel_portal).map(t => ({
        titulo: t.titulo,
        descricao: t.descricao,
        status: t.status,
    }))

    const arquivos = store.arquivos.filter(a => a.cliente_id === cliente.id && a.visivel_portal).map(a => ({
        id: a.id,
        nome: a.nome,
        tamanho: a.tamanho,
        url: a.dados_base64 ? 'Disponível para download' : null
    }))

    return NextResponse.json({
        cliente: {
            nome: cliente.nome,
            servico: cliente.servico,
            status: cliente.status
        },
        tarefas,
        arquivos
    })
}
