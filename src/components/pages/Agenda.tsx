import { useState } from 'react'
import { Store } from '../../hooks/useStore'
import { Card, Btn, SectionHeader, EmptyState } from '../ui'
import { VisitaModal } from '../VisitaModal'
import { fmtDate, gerarICS } from '../../lib/utils'
import { Visita } from '../../types'

interface Props { store: Store }

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function Agenda({ store }: Props) {
  const today = new Date()
  const [ano, setAno] = useState(today.getFullYear())
  const [mes, setMes] = useState(today.getMonth())
  const [visitaDate, setVisitaDate] = useState<string | null>(null)

  const exportarICS = (v: Visita) => {
    const rc = v.rcIdx != null ? store.state.rcs[v.rcIdx] : undefined
    gerarICS(v, rc?.rc, rc?.razao)
  }

  const navMes = (delta: number) => {
    let m = mes + delta, a = ano
    if (m < 0) { m = 11; a-- }
    if (m > 11) { m = 0; a++ }
    setMes(m); setAno(a)
  }

  const primeiroDia = new Date(ano, mes, 1).getDay()
  const diasNoMes = new Date(ano, mes + 1, 0).getDate()

  // mapa dia -> qtd visitas
  const visitasPorDia = new Map<number, number>()
  store.state.visitas.forEach(v => {
    const d = new Date(v.data + 'T00:00:00')
    if (d.getFullYear() === ano && d.getMonth() === mes) {
      visitasPorDia.set(d.getDate(), (visitasPorDia.get(d.getDate()) || 0) + 1)
    }
  })

  const hojeISO = iso(today.getFullYear(), today.getMonth(), today.getDate())
  const proximas = store.state.visitas
    .filter(v => v.data >= hojeISO)
    .sort((a, b) => a.data.localeCompare(b.data))

  const celulas: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]

  return (
    <div className="grid grid-cols-[1fr_320px] gap-6">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[17px] font-bold text-ink">{MESES[mes]} {ano}</h2>
          <div className="flex gap-1.5">
            <Btn variant="ghost" size="sm" onClick={() => navMes(-1)}>‹</Btn>
            <Btn variant="ghost" size="sm" onClick={() => { setAno(today.getFullYear()); setMes(today.getMonth()) }}>Hoje</Btn>
            <Btn variant="ghost" size="sm" onClick={() => navMes(1)}>›</Btn>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {DIAS_SEMANA.map(d => (
            <div key={d} className="text-center font-mono-dm text-[10px] tracking-widest uppercase text-ink-light py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {celulas.map((dia, i) => {
            if (dia === null) return <div key={`e${i}`} />
            const isoDia = iso(ano, mes, dia)
            const qtd = visitasPorDia.get(dia) || 0
            const ehHoje = isoDia === hojeISO
            return (
              <button
                key={dia}
                onClick={() => setVisitaDate(isoDia)}
                className={`aspect-square rounded-[8px] border flex flex-col items-center justify-center text-[13px] transition-all cursor-pointer relative ${
                  ehHoje ? 'border-accent-md bg-accent-lt/50 font-bold text-accent' : 'border-border hover:border-accent-md hover:bg-surface text-ink-mid'
                }`}
              >
                {dia}
                {qtd > 0 && (
                  <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-accent-md" title={`${qtd} visita(s)`} />
                )}
              </button>
            )
          })}
        </div>
        <p className="text-[11.5px] text-ink-faint mt-3">Clique em um dia para registrar uma visita. O ponto verde indica dias com visitas.</p>
      </Card>

      <div>
        <SectionHeader title="Próximas visitas">
          {proximas.length > 0 && (
            <Btn variant="secondary" size="sm" onClick={() => proximas.forEach(exportarICS)}>Exportar todas</Btn>
          )}
        </SectionHeader>
        {proximas.length === 0 ? (
          <Card className="p-1"><EmptyState icon="📅" title="Nenhuma visita futura" description="Agende clicando em um dia." /></Card>
        ) : (
          <div className="space-y-2">
            {proximas.map(v => {
              const rc = v.rcIdx != null ? store.state.rcs[v.rcIdx] : undefined
              const titulo = rc?.rc || v.clienteNome || 'Visita técnica'
              return (
                <Card key={v.id} className="p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono-dm text-[12px] font-bold text-accent">{fmtDate(v.data)}</span>
                    <button onClick={() => exportarICS(v)} className="text-[11px] text-ink-light hover:text-accent font-mono-dm" title="Exportar .ics">📤 ICS</button>
                  </div>
                  <div className="font-semibold text-[13px] text-ink">{titulo}</div>
                  <div className="text-[11.5px] text-ink-light">{v.gr} · {v.mt}</div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <VisitaModal store={store} open={visitaDate !== null} onClose={() => setVisitaDate(null)} defaultDate={visitaDate ?? undefined} />
    </div>
  )
}
