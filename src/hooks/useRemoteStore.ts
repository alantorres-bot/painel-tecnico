import { useState, useEffect, useRef, useCallback } from 'react'
import { AppState, GR, MT, RC, Visita, Cliente, Store, StoreOpts } from '../types'
import { GRS_INICIAL, MTS_INICIAL, RCS_INICIAL } from '../data/initial'
import { supabase } from '../lib/supabase'

const EMPTY: AppState = { grs: [], mts: [], rcs: [], visitas: [], clientes: [] }

// ── mapeadores linha do banco ⇄ objeto da app ──────────────
const rowToRC = (r: any): RC => ({
  gr: r.gr, mt: r.mt, rc: r.rc, razao: r.razao ?? '',
  notaRC: r.nota_rc, notaRegiao: r.nota_regiao, notaLog: r.nota_log,
  vol: Number(r.vol ?? 0), cidade: r.cidade ?? '', foco: !!r.foco,
})
const rcToRow = (r: RC) => ({
  gr: r.gr, mt: r.mt, rc: r.rc, razao: r.razao,
  nota_rc: r.notaRC, nota_regiao: r.notaRegiao, nota_log: r.notaLog,
  vol: r.vol, cidade: r.cidade, foco: r.foco,
})
const visitaToRow = (v: Visita, rcId: string | null) => ({
  data: v.data, tipo: v.tipo, gr: v.gr, mt: v.mt, rc_id: rcId,
  novos_clientes: v.novosClientes, rebanho: v.rebanho, tipo_rebanho: v.tipoRebanho,
  potencial: v.potencial, nivel_tec: v.nivelTec, proximo: v.proximo || null,
  obs: v.obs, cliente_nome: v.clienteNome,
})
const clienteToRow = (c: Cliente, rcId: string | null) => ({
  nome: c.nome, mt: c.mt, rc_id: rcId, tipo: c.tipo, size: c.size,
  pot: c.pot, cidade: c.cidade, obs: c.obs, ultimo_contato: c.ultimoContato || null,
})

export function useRemoteStore(opts: StoreOpts = {}): Store {
  const sb = supabase!
  const mode = opts.mode ?? 'own'
  const ownerId = opts.ownerId ?? null
  const readOnly = opts.readOnly ?? false
  const [state, setState] = useState<AppState>(EMPTY)
  const [loading, setLoading] = useState(true)
  // ids do banco alinhados com os índices dos arrays do state (grs/mts/rcs)
  const ids = useRef<{ grs: string[]; mts: string[]; rcs: string[] }>({ grs: [], mts: [], rcs: [] })

  const seed = useCallback(async () => {
    await sb.from('grs').insert(GRS_INICIAL.map(g => ({ codigo: g.codigo, nome: g.nome })))
    await sb.from('mts').insert(MTS_INICIAL.map(m => ({ gr: m.gr, codigo: m.codigo, nome: m.nome })))
    await sb.from('rcs').insert(RCS_INICIAL.map(rcToRow))
  }, [sb])

  const loadAll = useCallback(async () => {
    setLoading(true)
    // No modo gerente-one filtramos por owner; nos demais a RLS já decide
    // (supervisor = só os próprios; gerente-all = todos).
    const sel = (table: string, orderCol: string) => {
      let q = sb.from(table).select('*')
      if (mode === 'gerente-one' && ownerId) q = q.eq('owner', ownerId)
      return q.order(orderCol)
    }
    const [g, m, r, v, c] = await Promise.all([
      sel('grs', 'created_at'),
      sel('mts', 'created_at'),
      sel('rcs', 'created_at'),
      sel('visitas', 'data'),
      sel('clientes', 'created_at'),
    ])
    const gr = g.data ?? [], mt = m.data ?? [], rc = r.data ?? []
    ids.current = { grs: gr.map(x => x.id), mts: mt.map(x => x.id), rcs: rc.map(x => x.id) }
    const rcIndexById = new Map<string, number>(rc.map((x, i) => [x.id, i]))
    const idxOf = (rcId: string | null) => (rcId != null ? rcIndexById.get(rcId) ?? null : null)

    setState({
      grs: gr.map(x => ({ codigo: x.codigo, nome: x.nome ?? '' })),
      mts: mt.map(x => ({ gr: x.gr, codigo: x.codigo, nome: x.nome ?? '' })),
      rcs: rc.map(rowToRC),
      visitas: (v.data ?? []).map(x => ({
        id: x.id, data: x.data, tipo: x.tipo, gr: x.gr ?? '', mt: x.mt ?? '',
        rcIdx: idxOf(x.rc_id), novosClientes: x.novos_clientes ?? 0, rebanho: x.rebanho ?? 0,
        tipoRebanho: x.tipo_rebanho ?? '', potencial: Number(x.potencial ?? 0),
        nivelTec: x.nivel_tec ?? '', proximo: x.proximo ?? '', obs: x.obs ?? '',
        clienteNome: x.cliente_nome ?? '',
      })),
      clientes: (c.data ?? []).map(x => ({
        id: x.id, nome: x.nome, mt: x.mt ?? '', rcIdx: idxOf(x.rc_id), tipo: x.tipo ?? '',
        size: x.size ?? 0, pot: Number(x.pot ?? 0), cidade: x.cidade ?? '', obs: x.obs ?? '',
        ultimoContato: x.ultimo_contato ?? '',
      })),
    })
    setLoading(false)
  }, [sb, mode, ownerId])

  useEffect(() => { loadAll().catch(e => { console.error(e); setLoading(false) }) }, [loadAll])

  const err = (e: unknown) => { if (e) console.error('[supabase]', e) }

  // Semeia a base inicial (37 RCs) — opt-in, só faz sentido no modo próprio.
  const seedInicial = () => {
    if (readOnly || mode !== 'own') return
    setLoading(true)
    seed().then(() => loadAll()).catch(err)
  }

  // ── GRs ──────────────────────────────────────────────────
  const addGR = (gr: GR) => {
    if (readOnly) return
    setState(s => ({ ...s, grs: [...s.grs, gr] }))
    sb.from('grs').insert({ codigo: gr.codigo, nome: gr.nome }).select().single()
      .then(({ data, error }) => { err(error); if (data) ids.current.grs.push(data.id) })
  }
  const updateGR = (idx: number, gr: GR) => {
    if (readOnly) return
    setState(s => { const grs = [...s.grs]; grs[idx] = gr; return { ...s, grs } })
    sb.from('grs').update({ codigo: gr.codigo, nome: gr.nome }).eq('id', ids.current.grs[idx]).then(({ error }) => err(error))
  }
  const deleteGR = (idx: number) => {
    if (readOnly) return
    const id = ids.current.grs[idx]
    setState(s => ({ ...s, grs: s.grs.filter((_, i) => i !== idx) }))
    ids.current.grs.splice(idx, 1)
    sb.from('grs').delete().eq('id', id).then(({ error }) => err(error))
  }

  // ── MTs ──────────────────────────────────────────────────
  const addMT = (mt: MT) => {
    if (readOnly) return
    setState(s => ({ ...s, mts: [...s.mts, mt] }))
    sb.from('mts').insert({ gr: mt.gr, codigo: mt.codigo, nome: mt.nome }).select().single()
      .then(({ data, error }) => { err(error); if (data) ids.current.mts.push(data.id) })
  }
  const updateMT = (idx: number, mt: MT) => {
    if (readOnly) return
    setState(s => { const mts = [...s.mts]; mts[idx] = mt; return { ...s, mts } })
    sb.from('mts').update({ gr: mt.gr, codigo: mt.codigo, nome: mt.nome }).eq('id', ids.current.mts[idx]).then(({ error }) => err(error))
  }
  const deleteMT = (idx: number) => {
    if (readOnly) return
    const id = ids.current.mts[idx]
    setState(s => ({ ...s, mts: s.mts.filter((_, i) => i !== idx) }))
    ids.current.mts.splice(idx, 1)
    sb.from('mts').delete().eq('id', id).then(({ error }) => err(error))
  }

  // ── RCs ──────────────────────────────────────────────────
  const addRC = (rc: RC) => {
    if (readOnly) return
    setState(s => ({ ...s, rcs: [...s.rcs, rc] }))
    sb.from('rcs').insert(rcToRow(rc)).select().single()
      .then(({ data, error }) => { err(error); if (data) ids.current.rcs.push(data.id) })
  }
  const updateRC = (idx: number, rc: RC) => {
    if (readOnly) return
    setState(s => { const rcs = [...s.rcs]; rcs[idx] = rc; return { ...s, rcs } })
    sb.from('rcs').update(rcToRow(rc)).eq('id', ids.current.rcs[idx]).then(({ error }) => err(error))
  }
  const deleteRC = (idx: number) => {
    if (readOnly) return
    const id = ids.current.rcs[idx]
    sb.from('rcs').delete().eq('id', id).then(({ error }) => { err(error); loadAll().catch(err) })
  }
  const toggleFoco = (idx: number) => {
    if (readOnly) return
    let novo = false
    setState(s => {
      const rcs = [...s.rcs]; novo = !rcs[idx].foco; rcs[idx] = { ...rcs[idx], foco: novo }; return { ...s, rcs }
    })
    sb.from('rcs').update({ foco: novo }).eq('id', ids.current.rcs[idx]).then(({ error }) => err(error))
  }
  const importRCs = async (rcs: RC[], newGRs: GR[], newMTs: MT[]) => {
    if (readOnly) return
    const grsFaltando = newGRs.filter(g => !state.grs.find(x => x.codigo === g.codigo))
    const mtsFaltando = newMTs.filter(m => !state.mts.find(x => x.gr === m.gr && x.codigo === m.codigo))
    if (grsFaltando.length) err((await sb.from('grs').insert(grsFaltando.map(g => ({ codigo: g.codigo, nome: g.nome })))).error)
    if (mtsFaltando.length) err((await sb.from('mts').insert(mtsFaltando.map(m => ({ gr: m.gr, codigo: m.codigo, nome: m.nome })))).error)
    err((await sb.from('rcs').delete().gte('created_at', '1900-01-01')).error)
    err((await sb.from('rcs').insert(rcs.map(rcToRow))).error)
    await loadAll()
  }

  // ── Visitas / Clientes (apenas inserção no app) ──────────
  const addVisita = (v: Visita) => {
    if (readOnly) return
    const rcId = v.rcIdx != null ? ids.current.rcs[v.rcIdx] ?? null : null
    setState(s => ({ ...s, visitas: [...s.visitas, v] }))
    sb.from('visitas').insert(visitaToRow(v, rcId)).then(({ error }) => err(error))
  }
  const addCliente = (c: Cliente) => {
    if (readOnly) return
    const rcId = c.rcIdx != null ? ids.current.rcs[c.rcIdx] ?? null : null
    setState(s => ({ ...s, clientes: [...s.clientes, c] }))
    sb.from('clientes').insert(clienteToRow(c, rcId)).then(({ error }) => err(error))
  }

  // ── Helpers de visita ────────────────────────────────────
  const ultimaVisita = (rcIdx: number): string | null => {
    const rv = state.visitas.filter(v => v.rcIdx === rcIdx).sort((a, b) => b.data.localeCompare(a.data))
    return rv.length ? rv[0].data : null
  }
  const diasSemVisita = (rcIdx: number): number | null => {
    const ult = ultimaVisita(rcIdx)
    if (!ult) return null
    return Math.floor((Date.now() - new Date(ult + 'T00:00:00').getTime()) / 86400000)
  }

  // ── Backup / Reset ───────────────────────────────────────
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `backup_painel_${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const wipeAll = async () => {
    // ordem: filhos antes (visitas/clientes referenciam rcs)
    for (const t of ['visitas', 'clientes', 'rcs', 'mts', 'grs']) {
      err((await sb.from(t).delete().gte('created_at', '1900-01-01')).error)
    }
  }

  const importBackup = async (data: AppState) => {
    if (readOnly) return
    setLoading(true)
    await wipeAll()
    if (data.grs.length) err((await sb.from('grs').insert(data.grs.map(g => ({ codigo: g.codigo, nome: g.nome })))).error)
    if (data.mts.length) err((await sb.from('mts').insert(data.mts.map(m => ({ gr: m.gr, codigo: m.codigo, nome: m.nome })))).error)
    // insere rcs e recupera os ids na mesma ordem para mapear visitas/clientes
    const insRc = data.rcs.length ? await sb.from('rcs').insert(data.rcs.map(rcToRow)).select() : { data: [], error: null }
    err(insRc.error)
    const rcIds = (insRc.data ?? []).map((x: any) => x.id)
    const visRows = data.visitas.map(v => visitaToRow(v, v.rcIdx != null ? rcIds[v.rcIdx] ?? null : null))
    const cliRows = data.clientes.map(c => clienteToRow(c, c.rcIdx != null ? rcIds[c.rcIdx] ?? null : null))
    if (visRows.length) err((await sb.from('visitas').insert(visRows)).error)
    if (cliRows.length) err((await sb.from('clientes').insert(cliRows)).error)
    await loadAll()
  }

  // "Resetar" agora deixa a base VAZIA (o seed dos 37 RCs é opt-in via seedInicial).
  const resetData = async () => {
    if (readOnly) return
    setLoading(true)
    await wipeAll()
    await loadAll()
  }

  return {
    state, loading, readOnly,
    addGR, updateGR, deleteGR,
    addMT, updateMT, deleteMT,
    addRC, updateRC, deleteRC, toggleFoco, importRCs, seedInicial,
    addVisita, addCliente,
    ultimaVisita, diasSemVisita,
    exportBackup, importBackup, resetData,
  }
}
