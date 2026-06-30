import { useState } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { PageId } from './types'
import { useStore } from './hooks/useStore'
import { ToastProvider } from './hooks/useToast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { isSupabaseEnabled } from './lib/config'
import Login from './components/Login'
import Dashboard from './components/pages/Dashboard'
import Representantes from './components/pages/Representantes'
import Agenda from './components/pages/Agenda'
import Clientes from './components/pages/Clientes'
import Relatorios from './components/pages/Relatorios'
import Mapa from './components/pages/Mapa'
import Admin from './components/pages/Admin'

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: 'Dashboard Geral',
  representantes: 'Representantes Comerciais',
  agenda: 'Agenda de Visitas',
  clientes: 'Clientes / Rebanho',
  relatorios: 'Relatórios de Visitas',
  mapa: 'Mapa de RCs',
  admin: 'Administração',
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Gate />
      </ToastProvider>
    </AuthProvider>
  )
}

// Portão de acesso: só exige login quando o Supabase está configurado.
// Sem credenciais (config.ts vazio) → vai direto para o app (modo local).
function Gate() {
  const { session, loading } = useAuth()

  if (isSupabaseEnabled()) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface text-ink-light font-mono-dm text-[13px]">
          Carregando…
        </div>
      )
    }
    if (!session) return <Login />
  }

  return <Shell />
}

function Shell() {
  const [page, setPage] = useState<PageId>('dashboard')
  const store = useStore()
  const grsLabel = store.state.grs.map(g => g.codigo).join(' & ') + ' — BR'
  const showFilters = page === 'dashboard' || page === 'representantes'
  const [grFilter, setGrFilter] = useState('todos')

  if (store.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-ink-light font-mono-dm text-[13px]">
        Carregando dados…
      </div>
    )
  }

  return (
      <div className="flex min-h-screen">
        <Sidebar current={page} onNav={setPage} grsLabel={grsLabel} />
        <main className="ml-[248px] flex-1 flex flex-col min-h-screen">
          {/* Topbar */}
          <div className="bg-card border-b border-border h-14 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="font-display text-[17px] font-bold text-ink tracking-tight">
              {PAGE_TITLES[page]}
            </h2>
            {showFilters && (
              <div className="flex gap-1.5">
                {['todos', ...store.state.grs.map(g => g.codigo)].map(gr => (
                  <button
                    key={gr}
                    onClick={() => setGrFilter(gr)}
                    className={`px-3.5 py-1.5 rounded-full border text-[12px] font-mono-dm tracking-wide transition-all cursor-pointer ${
                      grFilter === gr
                        ? 'bg-ink text-white border-ink'
                        : 'bg-card text-ink-mid border-border-md hover:bg-ink hover:text-white hover:border-ink'
                    }`}
                  >
                    {gr === 'todos' ? 'Todas GRs' : gr}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Page content */}
          <div className="p-8 flex-1">
            {page === 'dashboard' && <Dashboard store={store} grFilter={grFilter} />}
            {page === 'representantes' && <Representantes store={store} grFilter={grFilter} />}
            {page === 'agenda' && <Agenda store={store} />}
            {page === 'clientes' && <Clientes store={store} />}
            {page === 'relatorios' && <Relatorios store={store} />}
            {page === 'mapa' && <Mapa store={store} />}
            {page === 'admin' && <Admin store={store} />}
          </div>
        </main>
      </div>
  )
}
