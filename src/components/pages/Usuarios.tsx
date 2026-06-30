import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Table, Btn, Input, FormGroup, SectionHeader, Card, Modal } from '../ui'
import { useToast } from '../../hooks/useToast'
import { useAuth } from '../../hooks/useAuth'
import { fmtDate } from '../../lib/utils'

interface Perfil { user_id: string; nome: string; email: string; role: string; ativo: boolean; created_at: string }

export default function Usuarios() {
  const { toast } = useToast()
  const { session } = useAuth()
  const meId = session?.user.id
  const [lista, setLista] = useState<Perfil[]>([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [pwAlvo, setPwAlvo] = useState<Perfil | null>(null) // alvo do "redefinir senha"
  const [novaSenha, setNovaSenha] = useState('')

  const carregar = () => {
    if (!supabase) return
    supabase
      .from('profiles')
      .select('user_id, nome, email, role, ativo, created_at')
      .order('created_at')
      .then(({ data }) => setLista((data as Perfil[]) ?? []))
  }
  useEffect(carregar, [])

  // Chamada genérica à Edge Function de gestão
  const chamar = async (body: Record<string, unknown>): Promise<boolean> => {
    if (!supabase) return false
    const { error } = await supabase.functions.invoke('create-supervisor', { body })
    if (error) {
      let msg = 'Falha na operação.'
      try { const j = await (error as { context: Response }).context.json(); if (j?.error) msg = j.error } catch { /* ignore */ }
      toast(msg)
      return false
    }
    return true
  }

  const criar = async () => {
    if (!email.trim() || !senha) { toast('Informe e-mail e senha.'); return }
    setLoading(true)
    const ok = await chamar({ action: 'create', nome: nome.trim(), email: email.trim(), password: senha })
    setLoading(false)
    if (!ok) return
    toast('Supervisor criado ✓')
    setNome(''); setEmail(''); setSenha('')
    carregar()
  }

  const trocarPapel = async (p: Perfil) => {
    const novo = p.role === 'gerente' ? 'supervisor' : 'gerente'
    if (await chamar({ action: 'set_role', user_id: p.user_id, role: novo })) {
      toast(novo === 'gerente' ? 'Promovido a gerente ✓' : 'Rebaixado a supervisor ✓')
      carregar()
    }
  }

  const trocarAtivo = async (p: Perfil) => {
    if (await chamar({ action: 'set_active', user_id: p.user_id, active: !p.ativo })) {
      toast(p.ativo ? 'Usuário desativado ✓' : 'Usuário reativado ✓')
      carregar()
    }
  }

  const redefinirSenha = async () => {
    if (!pwAlvo) return
    if (novaSenha.length < 6) { toast('A senha precisa ter ao menos 6 caracteres.'); return }
    if (await chamar({ action: 'reset_password', user_id: pwAlvo.user_id, password: novaSenha })) {
      toast('Senha redefinida ✓')
      setPwAlvo(null); setNovaSenha('')
    }
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
      <Table headers={['Nome', 'E-mail', 'Papel', 'Status', 'Ações']} empty={lista.length === 0}>
        {lista.map(p => {
          const eu = p.user_id === meId
          return (
            <tr key={p.user_id} className="border-b border-border last:border-0 hover:bg-surface">
              <td className="px-4 py-2.5 font-semibold text-ink">{p.nome || '—'}{eu && <span className="ml-1 text-[11px] text-ink-faint font-normal">(você)</span>}</td>
              <td className="px-4 py-2.5 text-ink-mid text-[12px]">{p.email}</td>
              <td className="px-4 py-2.5">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono-dm ${p.role === 'gerente' ? 'bg-amber-lt text-amber' : 'bg-accent-lt text-accent'}`}>
                  {p.role === 'gerente' ? 'Gerente' : 'Supervisor'}
                </span>
              </td>
              <td className="px-4 py-2.5">
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono-dm ${p.ativo ? 'bg-accent-lt text-accent' : 'bg-danger-lt text-danger'}`}>
                  {p.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right whitespace-nowrap">
                {eu ? (
                  <span className="text-[12px] text-ink-faint">—</span>
                ) : (
                  <>
                    <button className="text-[12px] text-ink-light hover:text-accent mr-3" onClick={() => trocarPapel(p)}>
                      {p.role === 'gerente' ? 'Rebaixar' : 'Promover'}
                    </button>
                    <button className="text-[12px] text-ink-light hover:text-amber mr-3" onClick={() => trocarAtivo(p)}>
                      {p.ativo ? 'Desativar' : 'Reativar'}
                    </button>
                    <button className="text-[12px] text-ink-light hover:text-accent" onClick={() => { setPwAlvo(p); setNovaSenha('') }}>
                      Redefinir senha
                    </button>
                  </>
                )}
              </td>
            </tr>
          )
        })}
      </Table>

      {/* Modal redefinir senha */}
      <Modal
        open={pwAlvo !== null}
        onClose={() => setPwAlvo(null)}
        title="Redefinir senha"
        sub={pwAlvo?.email}
        size="sm"
        footer={<>
          <Btn variant="ghost" onClick={() => setPwAlvo(null)}>Cancelar</Btn>
          <Btn variant="primary" onClick={redefinirSenha}>Salvar nova senha</Btn>
        </>}
      >
        <FormGroup label="Nova senha (mín. 6 caracteres)">
          <Input type="text" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} placeholder="nova senha" />
        </FormGroup>
        <p className="text-[11.5px] text-ink-faint mt-3">Anote e passe a nova senha para o supervisor.</p>
      </Modal>
    </div>
  )
}
