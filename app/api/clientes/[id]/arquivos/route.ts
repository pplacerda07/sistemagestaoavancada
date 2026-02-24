import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

async function registrar(cliente_id: string, tipo: string, descricao: string, user: any, supabase: any) {
    if (!cliente_id || !user) return;
    await supabase.from('atividades_cliente').insert([{
        cliente_id,
        tipo,
        descricao,
        usuario_id: user.id,
        usuario_nome: user.nome
    }]);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const supabase = createServerSupabase()

    // Select all fields including dados_base64
    const { data } = await supabase.from('anexos_cliente').select('*').eq('cliente_id', id).order('created_at', { ascending: false })

    // Map to expected frontend format which uses 'tamanho' instead of 'tamanho_bytes', 'nome' instead of 'nome_arquivo'
    const arquivos = (data || []).map(a => ({
        ...a,
        nome: a.nome_arquivo,
        tamanho: a.tamanho_bytes,
        tipo: a.tipo_conteudo
    }))

    return NextResponse.json(arquivos)
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const { nome, tamanho, tipo, dados_base64 } = await req.json()
    const supabase = createServerSupabase()

    const novo_arquivo = {
        cliente_id: id,
        nome_arquivo: nome,
        tamanho_bytes: tamanho || 0,
        tipo_conteudo: tipo || 'application/octet-stream',
        dados_base64: dados_base64 || null,
        visivel_portal: false,
        usuario_id: user.id
    }

    const { data: novo, error } = await supabase.from('anexos_cliente').insert([novo_arquivo]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await registrar(id, 'arquivo_enviado', `Arquivo enviado: ${nome}`, user, supabase)

    return NextResponse.json({
        ...novo,
        nome: novo.nome_arquivo,
        tamanho: novo.tamanho_bytes,
        tipo: novo.tipo_conteudo
    }, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const url = new URL(req.url)
    const arquivoId = url.searchParams.get('arquivo_id')

    if (arquivoId) {
        const supabase = createServerSupabase()
        const { data: arquivo } = await supabase.from('anexos_cliente').select('nome_arquivo').eq('id', arquivoId).eq('cliente_id', id).single()

        if (arquivo) {
            await supabase.from('anexos_cliente').delete().eq('id', arquivoId)
            await registrar(id, 'arquivo_removido', `Arquivo removido: ${arquivo.nome_arquivo}`, user, supabase)
        }
    }
    return NextResponse.json({ ok: true })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const body = await req.json()
    const arquivoId = body.arquivo_id
    if (!arquivoId) return NextResponse.json({ error: 'ID do arquivo obrigatório' }, { status: 400 })

    const supabase = createServerSupabase()
    const updateData: any = {}
    if (body.visivel_portal !== undefined) {
        updateData.visivel_portal = body.visivel_portal
    }

    const { data, error } = await supabase.from('anexos_cliente').update(updateData).eq('id', arquivoId).eq('cliente_id', id).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 })

    return NextResponse.json({
        ...data,
        nome: data.nome_arquivo,
        tamanho: data.tamanho_bytes,
        tipo: data.tipo_conteudo
    })
}
