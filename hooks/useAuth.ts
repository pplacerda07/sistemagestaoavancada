'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
    id: string
    nome: string
    username: string
    funcao: 'TI' | 'Marketing' | 'Admin'
    is_admin_matriz: boolean
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (username: string, senha: string) => Promise<{ error?: string }>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((data) => { if (data.user) setUser(data.user) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const login = async (username: string, senha: string) => {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, senha }),
        })
        const data = await res.json()
        if (!res.ok) return { error: data.error || 'Erro ao fazer login' }
        setUser(data.user)
        router.push('/dashboard')
        return {}
    }

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value= {{ user, loading, login, logout }
}>
    { children }
    </AuthContext.Provider>
  )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}
