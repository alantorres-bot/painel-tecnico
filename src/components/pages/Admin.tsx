import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { Store } from '../../hooks/useStore'
import { Table, GRBadge, MTBadge, Modal, Btn, Input, Select, FormGroup, SectionHeader, EmptyState } from '../ui'
import { GR, MT, RC, AppState } from '../../types'
import { useToast } from '../../hooks/useToast'

interface Props { store: Store }

type Tab = 'grs' | 'mts' | 'rcs' | 'dados'

const TABS: { id: Tab; label: string }[] = [
  { id: 'grs', label: 'GRs' },
  { id: 'mts', label: 'Microrregiões' },
  { id: 'rcs', label: 'Representantes' },
  { id: 'dados', label: 'Dados' },
]

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()

export default function Admin({ store }: Props) {
  const [tab, setTab] = useState<Tab>('grs')
  return (
    <div>
      <div className="flex gap-1 mb-5 border-b border-border">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-all ${tab === t.id ? 'border-accent text-accent' : 'border-transparent text-ink-light hover:text-ink-mid'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'grs' && <AbaGRs store={store} />}
      {tab === 'mts' && <AbaMTs store={store} />}
      {tab === 'rcs' && <AbaRCs store={store} />}
      {tab === 'dados' && <AbaDados store={store} />}
    </div>
  )
}

// ─────────────────────────────────────────── GRs
function AbaGRs({ store }: { store: Store }) {
  const { toast } = useToast()
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editGR, setEditGR] = useState<GR>({ codigo: '', nome: '' })

  const add = () => {
    if (!codigo.trim()) { toast('Informe o código da GR.'); return }
    if (store.state.grs.find(g => g.codigo === codigo.trim())) { toast('GR já existe.'); return }
    store.addGR({ codigo: codigo.trim(), nome: nome.trim() })
    setCodigo(''); setNome(''); toast('GR adicionada ✓')
  }

  return (
    <div>
      <SectionHeader title="Gerências Regionais" />
      <div className="flex gap-2 mb-4">
        <div className="w-32"><Input placeholder="Código (GR6)" value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
        <div className="flex-1"><Input placeholder="Nome / descrição" value={nome} onChange={e => setNome(e.target.value)} /></div>
        <Btn variant="primary" onClick={add}>Adicionar</Btn>
      </div>
      <Table headers={['Código', 'Nome', 'MTs', 'RCs', '']} empty={store.state.grs.length === 0}>
        {store.state.grs.map((g, i) => (
          <tr key={g.codigo} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5"><GRBadge gr={g.codigo} /></td>
            <td className="px-4 py-2.5 text-ink-mid text-[13px]">{g.nome || '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-light text-[12px]">{store.state.mts.filter(m => m.gr === g.codigo).length}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-light text-[12px]">{store.state.rcs.filter(r => r.gr === g.codigo).length}</td>
            <td className="px-4 py-2.5 text-right whitespace-nowrap">
              <button className="text-[12px] text-ink-light hover:text-accent mr-3" onClick={() => { setEditIdx(i); setEditGR(g) }}>Editar</button>
              <button className="text-[12px] text-ink-light hover:text-danger" onClick={() => store.deleteGR(i)}>Excluir</button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={editIdx !== null} onClose={() => setEditIdx(null)} title="Editar GR" size="sm"
        footer={<>
          <Btn variant="ghost" onClick={() => setEditIdx(null)}>Cancelar</Btn>
          <Btn variant="primary" onClick={() => { if (editIdx !== null) { store.updateGR(editIdx, editGR); toast('GR atualizada ✓'); setEditIdx(null) } }}>Salvar</Btn>
        </>}>
        <div className="space-y-4">
          <FormGroup label="Código"><Input value={editGR.codigo} onChange={e => setEditGR({ ...editGR, codigo: e.target.value })} /></FormGroup>
          <FormGroup label="Nome"><Input value={editGR.nome} onChange={e => setEditGR({ ...editGR, nome: e.target.value })} /></FormGroup>
        </div>
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────── MTs
function AbaMTs({ store }: { store: Store }) {
  const { toast } = useToast()
  const [gr, setGr] = useState('')
  const [codigo, setCodigo] = useState('')
  const [nome, setNome] = useState('')
  const [editIdx, setEditIdx] = useState<number | null>(null)
  const [editMT, setEditMT] = useState<MT>({ gr: '', codigo: '', nome: '' })

  const add = () => {
    if (!gr || !codigo.trim()) { toast('Selecione a GR e informe o código.'); return }
    if (store.state.mts.find(m => m.gr === gr && m.codigo === codigo.trim())) { toast('MT já existe nessa GR.'); return }
    store.addMT({ gr, codigo: codigo.trim(), nome: nome.trim() })
    setCodigo(''); setNome(''); toast('MT adicionada ✓')
  }

  return (
    <div>
      <SectionHeader title="Microrregiões (MTs)" />
      <div className="flex gap-2 mb-4">
        <div className="w-32">
          <Select value={gr} onChange={e => setGr(e.target.value)}>
            <option value="">GR…</option>
            {store.state.grs.map(g => <option key={g.codigo} value={g.codigo}>{g.codigo}</option>)}
          </Select>
        </div>
        <div className="w-32"><Input placeholder="Código (MT1)" value={codigo} onChange={e => setCodigo(e.target.value)} /></div>
        <div className="flex-1"><Input placeholder="Nome / descrição (opcional)" value={nome} onChange={e => setNome(e.target.value)} /></div>
        <Btn variant="primary" onClick={add}>Adicionar</Btn>
      </div>
      <Table headers={['GR', 'Código', 'Nome', 'RCs', '']} empty={store.state.mts.length === 0}>
        {store.state.mts.map((m, i) => (
          <tr key={`${m.gr}-${m.codigo}`} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5"><GRBadge gr={m.gr} /></td>
            <td className="px-4 py-2.5"><MTBadge mt={m.codigo} /></td>
            <td className="px-4 py-2.5 text-ink-mid text-[13px]">{m.nome || '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-light text-[12px]">{store.state.rcs.filter(r => r.gr === m.gr && r.mt === m.codigo).length}</td>
            <td className="px-4 py-2.5 text-right whitespace-nowrap">
              <button className="text-[12px] text-ink-light hover:text-accent mr-3" onClick={() => { setEditIdx(i); setEditMT(m) }}>Editar</button>
              <button className="text-[12px] text-ink-light hover:text-danger" onClick={() => store.deleteMT(i)}>Excluir</button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={editIdx !== null} onClose={() => setEditIdx(null)} title="Editar MT" size="sm"
        footer={<>
          <Btn variant="ghost" onClick={() => setEditIdx(null)}>Cancelar</Btn>
          <Btn variant="primary" onClick={() => { if (editIdx !== null) { store.updateMT(editIdx, editMT); toast('MT atualizada ✓'); setEditIdx(null) } }}>Salvar</Btn>
        </>}>
        <div className="space-y-4">
          <FormGroup label="GR">
            <Select value={editMT.gr} onChange={e => setEditMT({ ...editMT, gr: e.target.value })}>
              {store.state.grs.map(g => <option key={g.codigo} value={g.codigo}>{g.codigo}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Código"><Input value={editMT.codigo} onChange={e => setEditMT({ ...editMT, codigo: e.target.value })} /></FormGroup>
          <FormGroup label="Nome"><Input value={editMT.nome} onChange={e => setEditMT({ ...editMT, nome: e.target.value })} /></FormGroup>
        </div>
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────── RCs
function emptyRC(): RC {
  return { gr: '', mt: '', rc: '', razao: '', notaRC: null, notaRegiao: null, notaLog: null, vol: 0, cidade: '', foco: false }
}

function AbaRCs({ store }: { store: Store }) {
  const { toast } = useToast()
  const [grFilter, setGrFilter] = useState('todos')
  const [open, setOpen] = useState(false)
  const [editIdx, setEditIdx] = useState<number | null>(null) // null = novo
  const [f, setF] = useState<RC>(emptyRC())
  const set = (p: Partial<RC>) => setF(prev => ({ ...prev, ...p }))

  const comIdx = store.state.rcs.map((rc, idx) => ({ rc, idx })).filter(({ rc }) => grFilter === 'todos' || rc.gr === grFilter)

  const novo = () => { setF(emptyRC()); setEditIdx(null); setOpen(true) }
  const editar = (idx: number) => { setF({ ...store.state.rcs[idx] }); setEditIdx(idx); setOpen(true) }

  const salvar = () => {
    if (!f.rc.trim()) { toast('Informe o nome do RC.'); return }
    if (editIdx === null) { store.addRC(f); toast('RC adicionado ✓') }
    else { store.updateRC(editIdx, f); toast('RC atualizado ✓') }
    setOpen(false)
  }

  const numField = (v: number | null) => v === null ? '' : String(v)
  const toNumOrNull = (s: string): number | null => s === '' ? null : Number(s.replace(',', '.'))
  const mtsDaGr = store.state.mts.filter(m => m.gr === f.gr)

  return (
    <div>
      <SectionHeader title="Representantes Comerciais">
        <Select value={grFilter} onChange={e => setGrFilter(e.target.value)}>
          <option value="todos">Todas GRs</option>
          {store.state.grs.map(g => <option key={g.codigo} value={g.codigo}>{g.codigo}</option>)}
        </Select>
        <Btn variant="primary" size="sm" onClick={novo}>+ Novo RC</Btn>
      </SectionHeader>

      <Table headers={['GR', 'MT', 'RC', 'Razão Social', 'Nota RC', 'Vol.', '']} empty={comIdx.length === 0}>
        {comIdx.map(({ rc, idx }) => (
          <tr key={idx} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5"><GRBadge gr={rc.gr} /></td>
            <td className="px-4 py-2.5"><MTBadge mt={rc.mt} /></td>
            <td className="px-4 py-2.5 font-semibold text-ink">{rc.rc}</td>
            <td className="px-4 py-2.5 text-ink-light text-[12px]">{rc.razao}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{rc.notaRC?.toFixed(2) ?? '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{rc.vol}</td>
            <td className="px-4 py-2.5 text-right whitespace-nowrap">
              <button className="text-[12px] text-ink-light hover:text-accent mr-3" onClick={() => editar(idx)}>Editar</button>
              <button className="text-[12px] text-ink-light hover:text-danger" onClick={() => store.deleteRC(idx)}>Excluir</button>
            </td>
          </tr>
        ))}
      </Table>

      <Modal open={open} onClose={() => setOpen(false)} title={editIdx === null ? 'Novo RC' : 'Editar RC'}
        footer={<>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={salvar}>Salvar</Btn>
        </>}>
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="GR">
            <Select value={f.gr} onChange={e => set({ gr: e.target.value, mt: '' })}>
              <option value="">—</option>
              {store.state.grs.map(g => <option key={g.codigo} value={g.codigo}>{g.codigo}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="MT">
            <Select value={f.mt} onChange={e => set({ mt: e.target.value })}>
              <option value="">—</option>
              {mtsDaGr.map(m => <option key={m.codigo} value={m.codigo}>{m.codigo}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Nome do RC"><Input value={f.rc} onChange={e => set({ rc: e.target.value })} /></FormGroup>
          <FormGroup label="Cidade base"><Input value={f.cidade} onChange={e => set({ cidade: e.target.value })} /></FormGroup>
          <FormGroup label="Razão Social" full><Input value={f.razao} onChange={e => set({ razao: e.target.value })} /></FormGroup>
          <FormGroup label="Nota RC"><Input type="number" step="0.01" value={numField(f.notaRC)} onChange={e => set({ notaRC: toNumOrNull(e.target.value) })} /></FormGroup>
          <FormGroup label="Nota Região"><Input type="number" step="0.01" value={numField(f.notaRegiao)} onChange={e => set({ notaRegiao: toNumOrNull(e.target.value) })} /></FormGroup>
          <FormGroup label="Nota Logística"><Input type="number" step="0.01" value={numField(f.notaLog)} onChange={e => set({ notaLog: toNumOrNull(e.target.value) })} /></FormGroup>
          <FormGroup label="Volume (ton)"><Input type="number" step="0.1" value={f.vol} onChange={e => set({ vol: Number(e.target.value) })} /></FormGroup>
        </div>
      </Modal>
    </div>
  )
}

// ─────────────────────────────────────────── Dados
function AbaDados({ store }: { store: Store }) {
  const { toast } = useToast()
  const xlsxRef = useRef<HTMLInputElement>(null)
  const backupRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<{ rcs: RC[]; grs: GR[]; mts: MT[] } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const getVal = (row: Record<string, unknown>, pred: (k: string) => boolean): string => {
    for (const k of Object.keys(row)) if (pred(norm(k))) return String(row[k] ?? '')
    return ''
  }
  const numOrNull = (s: string): number | null => {
    const n = parseFloat(String(s).replace(',', '.'))
    return isNaN(n) ? null : n
  }

  const onXlsx = async (file: File) => {
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })

      const rcs: RC[] = rows.map(row => ({
        gr: getVal(row, k => k === 'regiao' || k === 'gr' || k === 'regional').trim(),
        mt: getVal(row, k => k === 'supervisao' || k === 'mt' || k.includes('supervis')).trim(),
        rc: getVal(row, k => k === 'rc' || k === 'representante').trim(),
        razao: getVal(row, k => k.includes('razao')).trim(),
        notaRC: numOrNull(getVal(row, k => k.includes('nota') && (k.includes('rc') || k === 'nota'))),
        notaRegiao: numOrNull(getVal(row, k => k.includes('nota') && k.includes('regi'))),
        notaLog: numOrNull(getVal(row, k => k.includes('nota') && k.includes('log'))),
        vol: numOrNull(getVal(row, k => k.includes('vol'))) ?? 0,
        cidade: getVal(row, k => k.includes('cidade')).trim(),
        foco: false,
      })).filter(r => r.rc)

      if (!rcs.length) { toast('Nenhum RC encontrado na planilha.'); return }

      const grs: GR[] = Array.from(new Set(rcs.map(r => r.gr).filter(Boolean))).map(c => ({ codigo: c, nome: '' }))
      const mtsSet = new Set(rcs.map(r => `${r.gr}|${r.mt}`).filter(x => !x.endsWith('|')))
      const mts: MT[] = Array.from(mtsSet).map(x => { const [gr, codigo] = x.split('|'); return { gr, codigo, nome: '' } })
      setPreview({ rcs, grs, mts })
    } catch (err) {
      toast('Erro ao ler a planilha.')
      console.error(err)
    }
  }

  const confirmarImport = () => {
    if (!preview) return
    store.importRCs(preview.rcs, preview.grs, preview.mts)
    toast(`${preview.rcs.length} RCs importados ✓`)
    setPreview(null)
  }

  const onBackup = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text) as AppState
      if (!data.rcs) { toast('Arquivo de backup inválido.'); return }
      store.importBackup(data)
      toast('Backup restaurado ✓')
    } catch {
      toast('Erro ao ler o backup.')
    }
  }

  const versaoLimpa = () => {
    const clean: AppState = { grs: store.state.grs, mts: store.state.mts, rcs: [], visitas: [], clientes: [] }
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'painel_versao_limpa.json'
    a.click()
    toast('Versão limpa baixada ✓')
  }

  const cardCls = 'bg-card rounded-[10px] border border-border p-5'

  return (
    <div>
      <SectionHeader title="Gestão de Dados" />
      <div className="grid grid-cols-2 gap-4">
        <div className={cardCls}>
          <h3 className="font-display text-[15px] font-bold text-ink mb-1">Importar Excel (.xlsx)</h3>
          <p className="text-[12px] text-ink-light mb-3">Substitui os RCs pela planilha. Cria GRs e MTs novas automaticamente. Mostra prévia antes de confirmar.</p>
          <input ref={xlsxRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onXlsx(f); e.target.value = '' }} />
          <Btn variant="primary" onClick={() => xlsxRef.current?.click()}>Selecionar planilha</Btn>
        </div>

        <div className={cardCls}>
          <h3 className="font-display text-[15px] font-bold text-ink mb-1">Backup (JSON)</h3>
          <p className="text-[12px] text-ink-light mb-3">Exporte todos os dados ou restaure de outro dispositivo.</p>
          <input ref={backupRef} type="file" accept=".json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onBackup(f); e.target.value = '' }} />
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={store.exportBackup}>Exportar</Btn>
            <Btn variant="ghost" onClick={() => backupRef.current?.click()}>Importar</Btn>
          </div>
        </div>

        <div className={cardCls}>
          <h3 className="font-display text-[15px] font-bold text-ink mb-1">Versão limpa</h3>
          <p className="text-[12px] text-ink-light mb-3">Baixe um arquivo sem dados (mantém GRs/MTs) para compartilhar com outro técnico.</p>
          <Btn variant="secondary" onClick={versaoLimpa}>Baixar versão limpa</Btn>
        </div>

        <div className={cardCls}>
          <h3 className="font-display text-[15px] font-bold text-ink mb-1">Resetar dados</h3>
          <p className="text-[12px] text-ink-light mb-3">Restaura os 37 RCs originais da planilha e apaga visitas/clientes.</p>
          <Btn variant="danger" onClick={() => setConfirmReset(true)}>Resetar</Btn>
        </div>
      </div>

      {/* Preview da importação */}
      <Modal open={preview !== null} onClose={() => setPreview(null)} title="Prévia da importação"
        sub={preview ? `${preview.rcs.length} RCs · ${preview.grs.length} GRs · ${preview.mts.length} MTs` : ''}
        footer={<>
          <Btn variant="ghost" onClick={() => setPreview(null)}>Cancelar</Btn>
          <Btn variant="primary" onClick={confirmarImport}>Confirmar importação</Btn>
        </>}>
        {preview && (
          preview.rcs.length === 0 ? <EmptyState icon="📄" title="Sem dados" /> : (
            <div className="max-h-[50vh] overflow-y-auto border border-border rounded-[10px]">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-surface">
                  <tr>{['GR', 'MT', 'RC', 'Nota RC', 'Cidade'].map(h => <th key={h} className="px-3 py-2 text-left font-mono-dm text-[10px] uppercase tracking-wide text-ink-light border-b border-border">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.rcs.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-3 py-1.5">{r.gr}</td>
                      <td className="px-3 py-1.5">{r.mt}</td>
                      <td className="px-3 py-1.5 font-semibold">{r.rc}</td>
                      <td className="px-3 py-1.5 font-mono-dm">{r.notaRC?.toFixed(2) ?? '—'}</td>
                      <td className="px-3 py-1.5">{r.cidade || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </Modal>

      {/* Confirmar reset */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Resetar todos os dados?" size="sm"
        footer={<>
          <Btn variant="ghost" onClick={() => setConfirmReset(false)}>Cancelar</Btn>
          <Btn variant="danger" onClick={() => { store.resetData(); setConfirmReset(false); toast('Dados resetados ✓') }}>Sim, resetar</Btn>
        </>}>
        <p className="text-[13px] text-ink-mid">Isso apaga todas as visitas e clientes cadastrados e restaura os 37 RCs originais. Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  )
}
