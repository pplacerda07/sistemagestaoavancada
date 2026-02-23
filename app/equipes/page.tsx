'use client'

import { useEffect, useState } from 'react'
import { Plus, Users, X, Loader2, UsersRound } from 'lucide-react'

export default function EquipesPage() {
    const [equipes, setEquipes] = useState<any[]>([])
    const [todoUsuarios, setTodoUsuarios] = useState<any[]>([])
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showModalEquipe, setShowModalEquipe] = useState(false)
    const [showModalMembro, setShowModalMembro] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [formEquipe, setFormEquipe] = useState({ nome: '', descricao: '' })
    const [selectedUsuario, setSelectedUsuario] = useState('')

    useEffect(() => {
        fetch('/api/auth/me').then(r => r.json()).then(d => setUser(d.user))
        load()
        fetch('/api/usuarios').then(r => r.json()).then(d => setTodoUsuarios(Array.isArray(d) ? d : []))
    }, [])

    const load = () => {
        setLoading(true)
        fetch('/api/equipes').then(r => r.json()).then(d => setEquipes(Array.isArray(d) ? d : [])).finally(() => setLoading(false))
    }

    const criarEquipe = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        await fetch('/api/equipes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formEquipe) })
        setSaving(false); setShowModalEquipe(false); setFormEquipe({ nome: '', descricao: '' }); load()
    }

    const adicionarMembro = async () => {
        if (!selectedUsuario || !showModalMembro) return
        setSaving(true)
        await fetch('/api/equipes/membros', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipe_id: showModalMembro, usuario_id: selectedUsuario }) })
        setSaving(false); setShowModalMembro(null); setSelectedUsuario(''); load()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Equipes</h1>
                    <p className="text-gray-500 text-sm mt-1">{equipes.length} equipes cadastradas</p>
                </div>
                <button onClick={() => setShowModalEquipe(true)} className="btn-primary">
                    <Plus size={16} /> Nova Equipe
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={28} /></div>
            ) : equipes.length === 0 ? (
                <div className="card flex flex-col items-center justify-center py-20 text-gray-400">
                    <UsersRound size={48} className="text-gray-200 mb-3" />
                    <p>Nenhuma equipe ainda</p>
                    <button onClick={() => setShowModalEquipe(true)} className="btn-primary mt-4 text-sm">Criar equipe</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {equipes.map(eq => (
                        <div key={eq.id} className="card p-6">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{eq.nome}</h3>
                                    {eq.descricao && <p className="text-xs text-gray-500 mt-0.5">{eq.descricao}</p>}
                                </div>
                                <div className="bg-indigo-50 text-indigo-600 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <UsersRound size={16} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Membros ({(eq.membros || []).length})</p>
                                    {user?.is_admin_matriz && (
                                        <button onClick={() => { setShowModalMembro(eq.id); setSelectedUsuario('') }}
                                            className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                                            <Plus size={12} /> Adicionar
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    {(eq.membros || []).slice(0, 4).map((m: any) => (
                                        <div key={m.id} className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                {m.usuario?.nome?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm text-gray-800 font-medium truncate">{m.usuario?.nome || 'Desconhecido'}</p>
                                                <p className="text-xs text-gray-400">{m.funcao || m.usuario?.funcao || '—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {(eq.membros || []).length === 0 && <p className="text-xs text-gray-400 italic">Nenhum membro ainda</p>}
                                    {(eq.membros || []).length > 4 && <p className="text-xs text-gray-400">+{(eq.membros || []).length - 4} mais...</p>}
                                </div>
                            </div>

                            <p className="text-xs text-gray-300 mt-4">Criador: {eq.criador?.nome || '—'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Nova Equipe */}
            {showModalEquipe && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModalEquipe(false)}>
                    <div className="modal-content">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Nova Equipe</h2>
                            <button onClick={() => setShowModalEquipe(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={criarEquipe} className="p-6 space-y-4">
                            <div>
                                <label className="form-label">Nome da Equipe *</label>
                                <input className="form-input" required value={formEquipe.nome} onChange={e => setFormEquipe(f => ({ ...f, nome: e.target.value }))} />
                            </div>
                            <div>
                                <label className="form-label">Descrição</label>
                                <textarea className="form-input resize-none" rows={3} value={formEquipe.descricao} onChange={e => setFormEquipe(f => ({ ...f, descricao: e.target.value }))} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" className="btn-secondary" onClick={() => setShowModalEquipe(false)}>Cancelar</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    {saving ? 'Criando...' : 'Criar Equipe'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Adicionar Membro */}
            {showModalMembro && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModalMembro(null)}>
                    <div className="modal-content" style={{ maxWidth: 420 }}>
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Adicionar Membro</h2>
                            <button onClick={() => setShowModalMembro(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="form-label">Selecionar Usuário</label>
                                <select className="form-input" value={selectedUsuario} onChange={e => setSelectedUsuario(e.target.value)}>
                                    <option value="">— Escolha um usuário —</option>
                                    {todoUsuarios.map(u => <option key={u.id} value={u.id}>{u.nome} ({u.funcao})</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button className="btn-secondary" onClick={() => setShowModalMembro(null)}>Cancelar</button>
                                <button className="btn-primary" onClick={adicionarMembro} disabled={!selectedUsuario || saving}>
                                    {saving && <Loader2 size={14} className="animate-spin" />}
                                    Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
