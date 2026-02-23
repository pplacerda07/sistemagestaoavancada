'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Loader2, UserCircle2, Shield } from 'lucide-react'

const FUNCOES = ['Admin', 'TI', 'Marketing']
const emptyForm = { nome: '', username: '', senha: '', funcao: 'Admin', is_admin_matriz: false }

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({ ...emptyForm })
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
        load()
    }, [])

    const load = () => {
        setLoading(true)
        fetch('/api/usuarios').then(r => r.json()).then(d => setUsuarios(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setError('')
        const res = await fetch('/api/usuarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Erro ao criar usuário'); setSaving(false); return }
        setSaving(false); setShowModal(false); setForm({ ...emptyForm }); load()
    }

    const FUNC_COLOR: Record<string, string> = { Admin: 'bg-purple-100 text-purple-700', TI: 'bg-blue-100 text-blue-700', Marketing: 'bg-pink-100 text-pink-700' }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
                    <p className="text-gray-500 text-sm mt-1">{usuarios.length} usuários cadastrados</p>
                </div>
                <button onClick={() => { setShowModal(true); setError('') }} className="btn-primary">
                    <Plus size={16} /> Novo Usuário
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={28} /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {usuarios.map(u => (
                        <div key={u.id} className="card p-5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                                    {u.nome.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-gray-900 truncate">{u.nome}</p>
                                        {u.is_admin_matriz && (
                                            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                                <Shield size={10} /> Admin Matriz
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-0.5">@{u.username}</p>
                                    <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${FUNC_COLOR[u.funcao] || 'bg-gray-100 text-gray-600'}`}>
                                        {u.funcao}
                                    </span>
                                </div>
                            </div>
                            {u.id === user?.id && (
                                <p className="text-xs text-indigo-500 font-medium mt-3 pt-3 border-t border-gray-100">Você</p>
                            )}
                        </div>
                    ))}
                    {usuarios.length === 0 && (
                        <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
                            <UserCircle2 size={48} className="text-gray-200 mb-3" />
                            <p>Nenhum usuário encontrado</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal Novo Usuário */}
            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Novo Usuário</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
                            <div>
                                <label className="form-label">Nome Completo *</label>
                                <input className="form-input" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">Username *</label>
                                    <input className="form-input" required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="form-label">Senha *</label>
                                    <input className="form-input" type="password" required value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="form-label">Função</label>
                                    <select className="form-input" value={form.funcao} onChange={e => setForm(f => ({ ...f, funcao: e.target.value }))}>
                                        {FUNCOES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-5">
                                    <input type="checkbox" id="isAdminMatriz" checked={form.is_admin_matriz} onChange={e => setForm(f => ({ ...f, is_admin_matriz: e.target.checked }))} className="w-4 h-4 accent-indigo-600" />
                                    <label htmlFor="isAdminMatriz" className="text-sm font-medium text-gray-700 cursor-pointer">Admin Matriz</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? 'Criando...' : 'Criar Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
