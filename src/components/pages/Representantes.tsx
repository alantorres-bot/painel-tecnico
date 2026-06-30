import { useState, useMemo } from 'react'
import { Store } from '../../hooks/useStore'
import { Table, GRBadge, MTBadge, NotaBar, Modal, Btn, Input, EmptyState } from '../ui'
import { VisitaModal } from '../VisitaModal'
import { fmtDate } from '../../lib/utils'

interface Props {
  store: Store
  grFilter: string
}

function DiasVisita({ store, idx }: { store: Store; idx: number }) {
  const dias = store.diasSemVisita(idx)
  if (dias === null) return <span className="text-ink-faint font-mono-dm text-[12px]">Nunca</span>
  const ult = store.ultimaVisita(idx)
  const cls = dias > 60 ? 'text-danger' : dias > 30 ? 'text-amber' : 'text-ink-mid'
  const dot = dias > 60 ? '🔴' : dias > 30 ? '🟡' : ''
  return (
    <span className={`font-mono-dm text-[12px] ${cls}`}>
      {dot} {fmtDate(ult!)} <span className="opacity-60">({dias}d)</span>
    </span>
  )
}

export default function Representantes({ store, grFilter }: Props) {
  const [search, setSearch] = useState('')
  const [mtFilter, setMtFilter] = useState('todas')
  const [detailIdx, setDetailIdx] = useState<number | null>(null)
  const [visitaFor, setVisitaFor] = useState<number | null>(null)

  // mantém índice absoluto em store.state.rcs
  const comIdx = store.state.rcs.map((rc, idx) => ({ rc, idx }))

  const porGr = comIdx.filter(({ rc }) => grFilter === 'todos' || rc.gr === grFilter)
  const mtsDisponiveis = useMemo(
    () => Array.from(new Set(porGr.map(({ rc }) => rc.mt))).sort(),
    [grFilter, store.state.rcs]
  )

  const filtrados = porGr.filter(({ rc }) => {
    if (mtFilter !== 'todas' && rc.mt !== mtFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return rc.rc.toLowerCase().includes(q) || rc.razao.toLowerCase().includes(q)
    }
    return true
  })

  const detail = detailIdx !== null ? store.state.rcs[detailIdx] : null
  const historico = detailIdx !== null
    ? store.state.visitas.filter(v => v.rcIdx === detailIdx).sort((a, b) => b.data.localeCompare(a.data))
    : []

  return (
    <div>
      {/* Barra de filtros */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="w-72">
          <Input placeholder="Buscar por nome ou razão social..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['todas', ...mtsDisponiveis].map(mt => (
            <button
              key={mt}
              onClick={() => setMtFilter(mt)}
              className={`px-3 py-1.5 rounded-full border text-[12px] font-mono-dm tracking-wide transition-all cursor-pointer ${
                mtFilter === mt ? 'bg-accent text-white border-accent' : 'bg-card text-ink-mid border-border-md hover:bg-accent hover:text-white hover:border-accent'
              }`}
            >
              {mt === 'todas' ? 'Todas MTs' : mt}
            </button>
          ))}
        </div>
      </div>

      <Table headers={['★', 'GR', 'MT', 'RC', 'Razão Social', 'Nota RC', 'Região', 'Log.', 'Vol.', 'Última Visita']} empty={filtrados.length === 0}>
        {filtrados.map(({ rc, idx }) => (
          <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface cursor-pointer" onClick={() => setDetailIdx(idx)}>
            <td className="px-4 py-2.5" onClick={e => { e.stopPropagation(); store.toggleFoco(idx) }}>
              <span className={`text-[16px] ${rc.foco ? 'text-amber' : 'text-ink-faint/40'}`}>★</span>
            </td>
            <td className="px-4 py-2.5"><GRBadge gr={rc.gr} /></td>
            <td className="px-4 py-2.5"><MTBadge mt={rc.mt} /></td>
            <td className="px-4 py-2.5 font-semibold text-ink whitespace-nowrap">{rc.rc}</td>
            <td className="px-4 py-2.5 text-ink-light text-[12px]">{rc.razao}</td>
            <td className="px-4 py-2.5"><NotaBar value={rc.notaRC} /></td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{rc.notaRegiao !== null ? rc.notaRegiao.toFixed(1) : '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{rc.notaLog !== null ? rc.notaLog.toFixed(1) : '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{rc.vol}</td>
            <td className="px-4 py-2.5"><DiasVisita store={store} idx={idx} /></td>
          </tr>
        ))}
      </Table>

      {/* Modal detalhe */}
      <Modal
        open={detail !== null}
        onClose={() => setDetailIdx(null)}
        title={detail?.rc ?? ''}
        sub={detail?.razao}
        footer={
          <>
            <Btn variant="ghost" onClick={() => setDetailIdx(null)}>Fechar</Btn>
            {!store.readOnly && (
              <Btn variant="primary" onClick={() => { setVisitaFor(detailIdx); }}>Registrar visita</Btn>
            )}
          </>
        }
      >
        {detail && (
          <div>
            <div className="flex gap-2 mb-5">
              <GRBadge gr={detail.gr} /><MTBadge mt={detail.mt} />
              {detail.cidade && <span className="px-2 py-0.5 rounded-full bg-field text-ink-mid text-[11px] font-mono-dm">📍 {detail.cidade}</span>}
              {detail.foco && <span className="px-2 py-0.5 rounded-full bg-amber-lt text-amber text-[11px] font-mono-dm font-semibold">★ Foco</span>}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Nota RC', value: detail.notaRC },
                { label: 'Nota Região', value: detail.notaRegiao },
                { label: 'Nota Logística', value: detail.notaLog },
              ].map(n => (
                <div key={n.label} className="bg-surface rounded-[10px] border border-border p-3">
                  <div className="font-mono-dm text-[9.5px] tracking-widest uppercase text-ink-light mb-1.5">{n.label}</div>
                  <div className="font-display text-[24px] font-black text-ink leading-none">{n.value !== null ? n.value.toFixed(1) : '—'}</div>
                </div>
              ))}
            </div>

            <div className="font-mono-dm text-[10px] tracking-widest uppercase text-ink-light mb-2">Histórico de visitas</div>
            {historico.length === 0 ? (
              <EmptyState icon="📭" title="Nenhuma visita registrada" description="Use o botão abaixo para registrar a primeira." />
            ) : (
              <div className="space-y-2">
                {historico.map(v => (
                  <div key={v.id} className="bg-surface border border-border rounded-[10px] px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-dm text-[12px] font-semibold text-ink">{fmtDate(v.data)}</span>
                      {v.rebanho > 0 && <span className="text-[11px] text-ink-light">{v.rebanho} cab. {v.tipoRebanho}</span>}
                    </div>
                    {v.obs && <p className="text-[12px] text-ink-mid mt-1">{v.obs}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <VisitaModal
        store={store}
        open={visitaFor !== null}
        onClose={() => setVisitaFor(null)}
        defaultRcIdx={visitaFor}
      />
    </div>
  )
}
