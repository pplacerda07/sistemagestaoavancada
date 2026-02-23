import { NextRequest, NextResponse } from 'next/server'
import store from '@/lib/db/store'
import { verifyToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value
    const user = token ? verifyToken(token) : null
    if (!user || !user.is_admin_matriz) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const custos = [...store.custos].sort((a, b) => b.data.localeCompare(a.data))
    return NextResponse.json(custos)
}
