import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export type Role = 'supervisor' | 'gerente'

interface ProfileCtx {
  role: Role | null
  nome: string
  isGerente: boolean
  loading: boolean
}

const Ctx = createContext<ProfileCtx>({ role: null, nome: '', isGerente: false, loading: false })

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const [role, setRole] = useState<Role | null>(null)
  const [nome, setNome] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!supabase || !session) {
      setRole(null); setNome(''); setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('profiles')
      .select('role, nome')
      .eq('user_id', session.user.id)
      .single()
      .then(({ data }) => {
        setRole((data?.role as Role) ?? 'supervisor')
        setNome(data?.nome ?? '')
        setLoading(false)
      })
  }, [session])

  return (
    <Ctx.Provider value={{ role, nome, isGerente: role === 'gerente', loading }}>
      {children}
    </Ctx.Provider>
  )
}

export const useProfile = () => useContext(Ctx)
