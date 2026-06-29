import { useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { Store } from '../../hooks/useStore'
import { Card, GRBadge, MTBadge, SectionHeader } from '../ui'
import { getCoordsForRC, notaColor, statusLabel } from '../../lib/utils'

interface Props { store: Store }

export default function Mapa({ store }: Props) {
  const [grFilter, setGrFilter] = useState('todos')
  const [mtFilter, setMtFilter] = useState('todas')

  const rcs = store.state.rcs
    .map((rc, idx) => ({ rc, idx }))
    .filter(({ rc }) => (grFilter === 'todos' || rc.gr === grFilter) && (mtFilter === 'todas' || rc.mt === mtFilter))

  const mtsDisponiveis = Array.from(
    new Set(store.state.rcs.filter(r => grFilter === 'todos' || r.gr === grFilter).map(r => r.mt))
  ).sort()

  const comCoords = rcs.map(x => ({ ...x, coords: getCoordsForRC(x.rc) }))
  const noMapa = comCoords.filter(x => x.coords)
  const semCidade = comCoords.filter(x => !x.coords)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1.5">
          {['todos', ...store.state.grs.map(g => g.codigo)].map(gr => (
            <button key={gr} onClick={() => { setGrFilter(gr); setMtFilter('todas') }}
              className={`px-3 py-1.5 rounded-full border text-[12px] font-mono-dm transition-all cursor-pointer ${grFilter === gr ? 'bg-ink text-white border-ink' : 'bg-card text-ink-mid border-border-md hover:bg-ink hover:text-white'}`}>
              {gr === 'todos' ? 'Todas GRs' : gr}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {['todas', ...mtsDisponiveis].map(mt => (
            <button key={mt} onClick={() => setMtFilter(mt)}
              className={`px-3 py-1.5 rounded-full border text-[12px] font-mono-dm transition-all cursor-pointer ${mtFilter === mt ? 'bg-accent text-white border-accent' : 'bg-card text-ink-mid border-border-md hover:bg-accent hover:text-white'}`}>
              {mt === 'todas' ? 'Todas MTs' : mt}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] font-mono-dm text-ink-light">
          <span>🟢 Bom</span><span>🟡 Atenção</span><span>🔴 Crítico</span><span style={{ color: '#E07B1A' }}>⭐ Foco</span>
        </div>
      </div>

      <Card className="overflow-hidden mb-5">
        <MapContainer center={[-13.2, -56.2]} zoom={6} style={{ height: 520, width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {noMapa.map(({ rc, idx, coords }) => {
            const color = rc.foco ? '#E07B1A' : notaColor(rc.notaRC)
            const dias = store.diasSemVisita(idx)
            return (
              <CircleMarker
                key={idx}
                center={[coords!.lat, coords!.lng]}
                radius={8 + rc.vol}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: 2 }}
              >
                <Popup>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', minWidth: 180 }}>
                    <strong style={{ fontSize: 14 }}>{rc.foco ? '⭐ ' : ''}{rc.rc}</strong>
                    <div style={{ fontSize: 11, color: '#666', marginBottom: 6 }}>{rc.razao}</div>
                    <div style={{ fontSize: 12 }}>{rc.gr} · {rc.mt} · 📍 {rc.cidade}</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>
                      Nota RC: <b>{rc.notaRC?.toFixed(2) ?? '—'}</b> — {statusLabel(rc.notaRC)}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
                      {dias === null ? 'Nunca visitado' : `${dias} dias sem visita`}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
        </MapContainer>
      </Card>

      {semCidade.length > 0 && (
        <div>
          <SectionHeader title={`RCs sem cidade cadastrada (${semCidade.length})`} />
          <Card className="p-4">
            <div className="flex flex-wrap gap-2">
              {semCidade.map(({ rc, idx }) => (
                <div key={idx} className="flex items-center gap-2 bg-surface border border-border rounded-full pl-2 pr-3 py-1">
                  <GRBadge gr={rc.gr} /><MTBadge mt={rc.mt} />
                  <span className="text-[12px] text-ink-mid font-medium">{rc.rc}</span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-ink-faint mt-3">Cadastre a cidade-base na Administração para que apareçam no mapa.</p>
          </Card>
        </div>
      )}
    </div>
  )
}
