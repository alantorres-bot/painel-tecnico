import { PageId } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import { isSupabaseEnabled } from '../../lib/config'

const NAV_ITEMS: { id: PageId; icon: string; label: string; section?: string }[] = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', section: 'Principal' },
  { id: 'representantes', icon: '🤝', label: 'Representantes' },
  { id: 'agenda', icon: '📅', label: 'Agenda de Visitas' },
  { id: 'clientes', icon: '🐄', label: 'Clientes', section: 'Gestão' },
  { id: 'relatorios', icon: '📋', label: 'Relatórios' },
  { id: 'mapa', icon: '🗺️', label: 'Mapa de RCs' },
  { id: 'admin', icon: '⚙️', label: 'Administração', section: 'Config.' },
]

interface Props {
  current: PageId
  onNav: (id: PageId) => void
  grsLabel: string
}

export function Sidebar({ current, onNav, grsLabel }: Props) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[248px] bg-ink flex flex-col z-50 border-r border-white/5">
      {/* Logo */}
      <div className="px-5 py-7 border-b border-white/8">
        <div className="font-mono-dm text-[10px] tracking-widest uppercase text-accent-md mb-1">
          Facholi
        </div>
        <h1 className="font-display text-[20px] font-black text-white leading-tight tracking-tight">
          Painel de<br />Supervisão Técnica
        </h1>
        <div className="font-mono-dm text-[11px] text-ink-faint mt-1 tracking-wide" id="sl-grs">
          {grsLabel}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => (
          <div key={item.id}>
            {item.section && (
              <div className="font-mono-dm text-[9.5px] tracking-widest uppercase text-white/20 px-5 pt-4 pb-1">
                {item.section}
              </div>
            )}
            <button
              onClick={() => onNav(item.id)}
              className={`w-full flex items-center gap-2.5 px-5 py-2.5 text-[13.5px] transition-all duration-100 border-l-2 text-left ${
                current === item.id
                  ? 'bg-accent/20 text-white border-accent-md font-semibold'
                  : 'text-white/50 border-transparent hover:bg-white/5 hover:text-white/80 font-normal'
              }`}
            >
              <span className="text-[15px] w-5 text-center opacity-85">{item.icon}</span>
              {item.label}
            </button>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/7">
        <div className="font-mono-dm text-[10px] text-white/25 tracking-wide">Supervisor Técnico</div>
        <div className="text-[12px] text-white/55 font-semibold mt-0.5">Zootecnista</div>
        <LogoutButton />
      </div>
    </aside>
  )
}

function LogoutButton() {
  const { session, signOut } = useAuth()
  if (!isSupabaseEnabled() || !session) return null
  return (
    <button
      onClick={() => signOut()}
      className="mt-3 w-full text-left font-mono-dm text-[11px] tracking-wide text-white/40 hover:text-white/80 transition-colors"
    >
      ⎋ Sair{session.user?.email ? ` · ${session.user.email}` : ''}
    </button>
  )
}
