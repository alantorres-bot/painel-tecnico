import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Table, Btn, Input, FormGroup, SectionHeader, Card } from '../ui'
import { useToast } from '../../hooks/useToast'
import { fmtDate } from '../../lib/utils'

interface Perfil { user_id: string; nome: string; email: string; role: string; created_at: string }

export default function Usuarios() {
  const { toast } = useToast()
  const [lista, setLista] = useState<Perfil[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)

  const carregar = () => {
    if (!supabase) return
    supabase
      .from('profiles')
      .select('user_id, nome, email, role, created_at')
      .order('created_at')
      .then(({ data }) => setLista((data as Perfil[]) ?? []))
  }
  useEffect(carregar, [])

  const criar = async () => {
    if (!supabase) return
    if (!email.trim() || !senha) { toast('Informe e-mail e senha.'); return }
    setLoading(true)
    const { error } = await supabase.functions.invoke('create-supervisor', {
      body: { nome: nome.trim(), email: email.trim(), password: senha },
    })
    setLoading(false)
    if (error) {
      let msg = 'Falha ao criar o supervisor.'
      try { const j = await (error as { context: Response }).context.json(); if (j?.error) msg = j.error } catch { /* ignore */ }
      toast(msg)
      return
    }
    toast('Supervisor criado ✓')
    setNome(''); setEmail(''); setSenha('')
    carregar()
  }

  const supervisores = lista.filter(p => p.role === 'supervisor')

  return (
    <div>
      <SectionHeader title="Usuários" />

      <Card className="p-5 mb-6">
        <h3 className="font-display text-[15px] font-bold text-ink mb-1">Criar supervisor</h3>
        <p className="text-[12px] text-ink-light mb-4">
          O novo supervisor entra com este e‑mail e senha e começa com a base vazia (importa a planilha da região dele).
        </p>
        <div className="grid grid-cols-3 gap-4">
          <FormGroup label="Nome">
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do supervisor" />
          </FormGroup>
          <FormGroup label="E-mail *">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="supervisor@exemplo.com" />
          </FormGroup>
          <FormGroup label="Senha *">
            <Input type="text" value={senha} onChange={e => setSenha(e.target.value)} placeholder="mín. 6 caracteres" />
          </FormGroup>
        </div>
        <div className="mt-4">
          <Btn variant="primary" onClick={criar}>{loading ? 'Criando…' : 'Criar supervisor'}</Btn>
        </div>
      </Card>

      <SectionHeader title={`Supervisores (${supervisores.length})`} />
      <Table headers={['Nome', 'E-mail', 'Papel', 'Criado em']} empty={lista.length === 0}>
        {lista.map(p => (
          <tr key={p.user_id} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5 font-semibold text-ink">{p.nome || '—'}</td>
            <td className="px-4 py-2.5 text-ink-mid text-[12px]">{p.email}</td>
            <td className="px-4 py-2.5">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono-dm ${p.role === 'gerente' ? 'bg-amber-lt text-amber' : 'bg-accent-lt text-accent'}`}>
                {p.role === 'gerente' ? 'Gerente' : 'Supervisor'}
              </span>
            </td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-light text-[12px]">{p.created_at ? fmtDate(p.created_at.slice(0, 10)) : '—'}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
