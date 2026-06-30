import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Sup { user_id: string; nome: string; email: string }

// Seletor do gerente: "Visão Nacional" (todos) ou um supervisor específico.
export function SupervisorSwitcher({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [sups, setSups] = useState<Sup[]>([])

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('profiles')
      .select('user_id, nome, email')
      .eq('role', 'supervisor')
      .order('email')
      .then(({ data }) => setSups((data as Sup[]) ?? []))
  }, [])

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-border-md rounded-full px-3 py-1.5 text-[12px] font-mono-dm text-ink bg-card focus:outline-none focus:border-accent-md cursor-pointer max-w-[220px]"
    >
      <option value="all">🌎 Visão Nacional</option>
      {sups.map(s => (
        <option key={s.user_id} value={s.user_id}>{s.nome || s.email}</option>
      ))}
    </select>
  )
}
