import { useState, FormEvent } from 'react'
import { Btn, Input, FormGroup } from './ui'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    const { error } = await signIn(email.trim(), senha)
    setLoading(false)
    if (error) setErro(traduzErro(error))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-[380px]">
        {/* Marca */}
        <div className="text-center mb-7">
          <div className="font-mono-dm text-[10px] tracking-widest uppercase text-accent-md mb-1.5">
            Facholi
          </div>
          <h1 className="font-display text-[26px] font-black text-white leading-tight tracking-tight">
            Painel de<br />Supervisão Técnica
          </h1>
        </div>

        {/* Card de login */}
        <form onSubmit={submit} className="bg-card rounded-[14px] shadow-2xl p-7">
          <h2 className="font-display text-[17px] font-bold text-ink mb-5">Entrar</h2>

          <div className="space-y-4">
            <FormGroup label="E-mail">
              <Input
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                required
              />
            </FormGroup>
            <FormGroup label="Senha">
              <Input
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                required
              />
            </FormGroup>
          </div>

          {erro && (
            <div className="mt-4 text-[12.5px] text-danger bg-danger-lt border border-danger/20 rounded-md px-3 py-2">
              {erro}
            </div>
          )}

          <div className="mt-5">
            <Btn type="submit" variant="primary" className="w-full justify-center">
              {loading ? 'Entrando…' : 'Entrar'}
            </Btn>
          </div>

          <p className="text-[11.5px] text-ink-faint mt-4 text-center">
            O acesso é criado pelo administrador no Supabase (Authentication → Users).
          </p>
        </form>
      </div>
    </div>
  )
}

function traduzErro(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'E-mail ainda não confirmado.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Sem conexão com o servidor.'
  return msg
}
