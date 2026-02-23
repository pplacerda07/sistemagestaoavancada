import { NextRequest, NextResponse } from 'next/server'
import store, { uuid, now } from '@/lib/db/store'

export async function POST(req: NextRequest, { params }: { params: Promise<{ hash: string }> }) {
    const { hash } = await params

    const cliente = store.clientes.find(c => c.portal_hash === hash && c.portal_ativo)

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
            id: `msg-${uuid()}`,
            cliente_id: cliente.id,
            mensagem,
            lida: false,
            created_at: now()
        }

        store.mensagens_portal.push(novaMensagem)

        return NextResponse.json({ success: true, id: novaMensagem.id })
    } catch (e) {
        return NextResponse.json({ error: 'Erro ao processar mensagem.' }, { status: 500 })
    }
}
