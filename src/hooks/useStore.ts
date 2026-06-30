import { useState, useEffect, useCallback } from 'react'
import { AppState, GR, MT, RC, Visita, Cliente, Store } from '../types'
import { GRS_INICIAL, MTS_INICIAL, RCS_INICIAL } from '../data/initial'
import { isSupabaseEnabled } from '../lib/config'
import { useRemoteStore } from './useRemoteStore'

const KEYS = {
  grs: 'pt_grs',
  mts: 'pt_mts',
  rcs: 'pt_rcs',
  visitas: 'pt_vis',
  clientes: 'pt_cli',
}

function loadState(): AppState {
  try {
    return {
      grs: JSON.parse(localStorage.getItem(KEYS.grs) || 'null') ?? GRS_INICIAL,
      mts: JSON.parse(localStorage.getItem(KEYS.mts) || 'null') ?? MTS_INICIAL,
      rcs: JSON.parse(localStorage.getItem(KEYS.rcs) || 'null') ?? JSON.parse(JSON.stringify(RCS_INICIAL)),
      visitas: JSON.parse(localStorage.getItem(KEYS.visitas) || '[]'),
      clientes: JSON.parse(localStorage.getItem(KEYS.clientes) || '[]'),
    }
  } catch {
    return {
      grs: GRS_INICIAL,
      mts: MTS_INICIAL,
      rcs: JSON.parse(JSON.stringify(RCS_INICIAL)),
      visitas: [],
      clientes: [],
    }
  }
}

function saveState(state: AppState) {
  localStorage.setItem(KEYS.grs, JSON.stringify(state.grs))
  localStorage.setItem(KEYS.mts, JSON.stringify(state.mts))
  localStorage.setItem(KEYS.rcs, JSON.stringify(state.rcs))
  localStorage.setItem(KEYS.visitas, JSON.stringify(state.visitas))
  localStorage.setItem(KEYS.clientes, JSON.stringify(state.clientes))
}

function useLocalStore(): Store {
  const [state, setState] = useState<AppState>(loadState)

  useEffect(() => { saveState(state) }, [state])

  const update = useCallback((partial: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...partial }))
  }, [])

  // GRs
  const addGR = (gr: GR) => update({ grs: [...state.grs, gr] })
  const updateGR = (idx: number, gr: GR) => {
    const grs = [...state.grs]; grs[idx] = gr; update({ grs })
  }
  const deleteGR = (idx: number) => {
    update({ grs: state.grs.filter((_, i) => i !== idx) })
  }

  // MTs
  const addMT = (mt: MT) => update({ mts: [...state.mts, mt] })
  const updateMT = (idx: number, mt: MT) => {
    const mts = [...state.mts]; mts[idx] = mt; update({ mts })
  }
  const deleteMT = (idx: number) => {
    update({ mts: state.mts.filter((_, i) => i !== idx) })
  }

  // RCs
  const addRC = (rc: RC) => update({ rcs: [...state.rcs, rc] })
  const updateRC = (idx: number, rc: RC) => {
    const rcs = [...state.rcs]; rcs[idx] = rc; update({ rcs })
  }
  const deleteRC = (idx: number) => {
    update({ rcs: state.rcs.filter((_, i) => i !== idx) })
  }
  const toggleFoco = (idx: number) => {
    const rcs = [...state.rcs]
    rcs[idx] = { ...rcs[idx], foco: !rcs[idx].foco }
    update({ rcs })
  }
  const importRCs = (rcs: RC[], newGRs: GR[], newMTs: MT[]) => {
    const grs = [...state.grs]
    const mts = [...state.mts]
    newGRs.forEach(g => { if (!grs.find(x => x.codigo === g.codigo)) grs.push(g) })
    newMTs.forEach(m => { if (!mts.find(x => x.gr === m.gr && x.codigo === m.codigo)) mts.push(m) })
    update({ rcs, grs, mts })
  }

  // Visitas
  const addVisita = (v: Visita) => update({ visitas: [...state.visitas, v] })

  // Clientes
  const addCliente = (c: Cliente) => update({ clientes: [...state.clientes, c] })

  // Helpers
  const ultimaVisita = (rcIdx: number): string | null => {
    const rv = state.visitas.filter(v => v.rcIdx === rcIdx).sort((a, b) => b.data.localeCompare(a.data))
    return rv.length ? rv[0].data : null
  }
  const diasSemVisita = (rcIdx: number): number | null => {
    const ult = ultimaVisita(rcIdx)
    if (!ult) return null
    return Math.floor((Date.now() - new Date(ult + 'T00:00:00').getTime()) / 86400000)
  }

  // Backup
  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `backup_painel_${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }
  const importBackup = (data: AppState) => {
    setState(data)
    saveState(data)
  }
  const resetData = () => {
    const fresh: AppState = {
      grs: GRS_INICIAL,
      mts: MTS_INICIAL,
      rcs: JSON.parse(JSON.stringify(RCS_INICIAL)),
      visitas: [],
      clientes: [],
    }
    setState(fresh)
    saveState(fresh)
  }

  return {
    state,
    loading: false,
    addGR, updateGR, deleteGR,
    addMT, updateMT, deleteMT,
    addRC, updateRC, deleteRC, toggleFoco, importRCs,
    addVisita,
    addCliente,
    ultimaVisita, diasSemVisita,
    exportBackup, importBackup, resetData,
  }
}

// Escolhe o backend uma única vez (config é constante em build):
// com Supabase configurado usa o store remoto; senão, o localStorage.
export const useStore: () => Store = isSupabaseEnabled() ? useRemoteStore : useLocalStore

export type { Store } from '../types'
