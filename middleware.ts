import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const PROTECTED_PAGES = ['/dashboard', '/clientes', '/tarefas', '/equipes', '/financeiro', '/usuarios', '/alertas']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    const isProtected = PROTECTED_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (!isProtected) return NextResponse.next()

    const token = request.cookies.get('auth_token')?.value
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/(dashboard|clientes|tarefas|equipes|financeiro|usuarios|alertas)(.*)',
    ],
}
