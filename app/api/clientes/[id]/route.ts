import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/jwt'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { id } = await params
    const supabase = createServerSupabase()
    const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).single()

    if (!cliente) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
    return NextResponse.json(cliente)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const supabase = createServerSupabase()

    const { data: existing } = await supabase.from('clientes').select('portal_hash, portal_ativo').eq('id', id).single()
    if (!existing) return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })

    let portal_hash = existing.portal_hash
    const portal_ativo = body.portal_ativo ?? existing.portal_ativo

    if (portal_ativo && !portal_hash) {
        portal_hash = crypto.randomUUID()
    }

    const updateData: any = {}
    if (body.nome !== undefined) updateData.nome = body.nome
    if (body.email !== undefined) updateData.email = body.email
    if (body.telefone !== undefined) updateData.telefone = body.telefone
    if (body.servico !== undefined) updateData.servico = body.servico
    if (body.valor_mensal !== undefined) updateData.valor_mensal = body.valor_mensal !== null ? Number(body.valor_mensal) : null
    if (body.tipo_contrato !== undefined) updateData.tipo_contrato = body.tipo_contrato
    if (body.data_inicio !== undefined) updateData.data_inicio = body.data_inicio
    if (body.status !== undefined) updateData.status = body.status
    if (body.observacoes !== undefined) updateData.observacoes = body.observacoes
    if (body.horas_semanais_planejadas !== undefined) updateData.horas_semanais_planejadas = body.horas_semanais_planejadas !== null ? Number(body.horas_semanais_planejadas) : null

    updateData.portal_ativo = portal_ativo
    updateData.portal_hash = portal_hash
    updateData.updated_at = new Date().toISOString()

    const { data: updated, error } = await supabase.from('clientes').update(updateData).eq('id', id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { id } = await params
    const supabase = createServerSupabase()

    const { error } = await supabase.from('clientes').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
