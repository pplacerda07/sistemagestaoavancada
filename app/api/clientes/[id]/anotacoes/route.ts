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
    const { data } = await supabase.from('anotacoes_cliente').select('*').eq('cliente_id', id).order('created_at', { ascending: false })
    return NextResponse.json(data || [])
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const { titulo, conteudo } = await req.json()
    const supabase = createServerSupabase()

    const nova_anotacao = {
        cliente_id: id,
        titulo: titulo || 'Sem título',
        conteudo: conteudo || '',
        usuario_id: user.id
    }

    const { data: nova, error } = await supabase.from('anotacoes_cliente').insert([nova_anotacao]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await registrar(id, 'anotacao_criada', `Anotação adicionada: ${nova.titulo}`, user, supabase)

    return NextResponse.json(nova, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = req.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    const { id } = await params
    const url = new URL(req.url)
    const anotacaoId = url.searchParams.get('anotacao_id')

    if (anotacaoId) {
        const supabase = createServerSupabase()
        const { data: anotacao } = await supabase.from('anotacoes_cliente').select('titulo').eq('id', anotacaoId).eq('cliente_id', id).single()

        if (anotacao) {
            await supabase.from('anotacoes_cliente').delete().eq('id', anotacaoId)
            await registrar(id, 'anotacao_removida', `Anotação removida: ${anotacao.titulo}`, user, supabase)
        }
    }
    return NextResponse.json({ ok: true })
}
