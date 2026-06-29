import { Store } from '../../hooks/useStore'
import { StatCard, Table, GRBadge, MTBadge, NotaBar, StatusBadge, SectionHeader } from '../ui'
import { RC } from '../../types'

interface Props {
  store: Store
  grFilter: string
}

function media(nums: (number | null)[]): number | null {
  const v = nums.filter((n): n is number => n !== null)
  if (!v.length) return null
  return v.reduce((a, b) => a + b, 0) / v.length
}

export default function Dashboard({ store, grFilter }: Props) {
  const rcs = store.state.rcs.filter(r => grFilter === 'todos' || r.gr === grFilter)

  const avgRC = media(rcs.map(r => r.notaRC))
  const avgRegiao = media(rcs.map(r => r.notaRegiao))

  const now = new Date()
  const visitasMes = store.state.visitas.filter(v => {
    const d = new Date(v.data + 'T00:00:00')
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  // Agrupa por MT
  const porMT = new Map<string, RC[]>()
  rcs.forEach(r => {
    const key = `${r.gr}|${r.mt}`
    if (!porMT.has(key)) porMT.set(key, [])
    porMT.get(key)!.push(r)
  })
  const linhasMT = Array.from(porMT.entries())
    .map(([key, list]) => {
      const [gr, mt] = key.split('|')
      return {
        gr, mt, qtd: list.length,
        notaRC: media(list.map(r => r.notaRC)),
        notaRegiao: media(list.map(r => r.notaRegiao)),
        notaLog: media(list.map(r => r.notaLog)),
      }
    })
    .sort((a, b) => a.gr.localeCompare(b.gr) || a.mt.localeCompare(b.mt))

  const topRCs = [...rcs]
    .filter(r => r.notaRC !== null)
    .sort((a, b) => (b.notaRC ?? 0) - (a.notaRC ?? 0))
    .slice(0, 10)

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-7">
        <StatCard label="Total de RCs" value={rcs.length} accent sub={`${grFilter === 'todos' ? 'Todas as GRs' : grFilter}`} />
        <StatCard label="Nota Média RC" value={avgRC !== null ? avgRC.toFixed(2) : '—'} sub="Escala 0–5" />
        <StatCard label="Nota Média Região" value={avgRegiao !== null ? avgRegiao.toFixed(2) : '—'} sub="Escala 0–5" />
        <StatCard label="Visitas do Mês" value={visitasMes} sub={now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} />
      </div>

      <SectionHeader title="Desempenho por Microrregião (MT)" />
      <Table headers={['GR', 'MT', 'Qtd RCs', 'Nota RC', 'Região', 'Logística', 'Status']} empty={linhasMT.length === 0}>
        {linhasMT.map(l => (
          <tr key={`${l.gr}-${l.mt}`} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5"><GRBadge gr={l.gr} /></td>
            <td className="px-4 py-2.5"><MTBadge mt={l.mt} /></td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid">{l.qtd}</td>
            <td className="px-4 py-2.5"><NotaBar value={l.notaRC} /></td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{l.notaRegiao !== null ? l.notaRegiao.toFixed(1) : '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{l.notaLog !== null ? l.notaLog.toFixed(1) : '—'}</td>
            <td className="px-4 py-2.5"><StatusBadge nota={l.notaRC} /></td>
          </tr>
        ))}
      </Table>

      <div className="mt-6">
        <SectionHeader title="Top Representantes Comerciais" />
        <Table headers={['#', 'RC', 'Razão Social', 'GR', 'MT', 'Nota RC', 'Vol.']} empty={topRCs.length === 0}>
          {topRCs.map((r, i) => (
            <tr key={`${r.rc}-${i}`} className="border-b border-border last:border-0 hover:bg-surface">
              <td className="px-4 py-2.5 font-mono-dm text-ink-faint text-[12px]">{i + 1}</td>
              <td className="px-4 py-2.5 font-semibold text-ink">{r.foco && <span className="text-amber mr-1">★</span>}{r.rc}</td>
              <td className="px-4 py-2.5 text-ink-light text-[12px]">{r.razao}</td>
              <td className="px-4 py-2.5"><GRBadge gr={r.gr} /></td>
              <td className="px-4 py-2.5"><MTBadge mt={r.mt} /></td>
              <td className="px-4 py-2.5"><NotaBar value={r.notaRC} /></td>
              <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{r.vol}</td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  )
}
