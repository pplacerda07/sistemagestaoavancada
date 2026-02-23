import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/db/store'

export async function GET(req: NextRequest, { params }: { params: Promise<{ hash: string, arquivo_id: string }> }) {
    const { hash, arquivo_id } = await params

    const cliente = store.clientes.find(c => c.portal_hash === hash && c.portal_ativo)
    if (!cliente) {
        return NextResponse.json({ error: 'Portal não encontrado ou inativo.' }, { status: 404 })
    }

    const arquivo = store.arquivos.find(a => a.id === arquivo_id && a.cliente_id === cliente.id && a.visivel_portal)
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
            'Content-Type': arquivo.tipo || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(arquivo.nome)}"`
        }
    })
}
