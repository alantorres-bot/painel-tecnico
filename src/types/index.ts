export interface GR {
  codigo: string
  nome: string
}

export interface MT {
  gr: string
  codigo: string
  nome: string
}

export interface RC {
  gr: string
  mt: string
  rc: string
  razao: string
  notaRC: number | null
  notaRegiao: number | null
  notaLog: number | null
  vol: number
  cidade: string
  foco: boolean
}

export interface Visita {
  id: string
  data: string
  tipo: 'representante' | 'supervisor' | 'cliente_direto'
  gr: string
  mt: string
  rcIdx: number | null
  novosClientes: number
  rebanho: number
  tipoRebanho: string
  potencial: number
  nivelTec: string
  proximo: string
  obs: string
  clienteNome: string
}

export interface Cliente {
  id: string
  nome: string
  mt: string
  rcIdx: number | null
  tipo: string
  size: number
  pot: number
  cidade: string
  obs: string
  ultimoContato: string
}

export type TipoVisita = 'representante' | 'supervisor' | 'cliente_direto'

export interface AppState {
  grs: GR[]
  mts: MT[]
  rcs: RC[]
  visitas: Visita[]
  clientes: Cliente[]
}

// Opções de modo do store (usadas pelo gerente para ver dados de terceiros).
export interface StoreOpts {
  mode?: 'own' | 'gerente-all' | 'gerente-one'
  ownerId?: string | null
  readOnly?: boolean
}

// Interface comum aos dois backends (localStorage e Supabase).
// As páginas dependem só disto, então trocar de backend não muda as telas.
export interface Store {
  state: AppState
  loading: boolean
  readOnly: boolean
  addGR: (gr: GR) => void
  updateGR: (idx: number, gr: GR) => void
  deleteGR: (idx: number) => void
  addMT: (mt: MT) => void
  updateMT: (idx: number, mt: MT) => void
  deleteMT: (idx: number) => void
  addRC: (rc: RC) => void
  updateRC: (idx: number, rc: RC) => void
  deleteRC: (idx: number) => void
  toggleFoco: (idx: number) => void
  importRCs: (rcs: RC[], newGRs: GR[], newMTs: MT[]) => void
  seedInicial: () => void
  addVisita: (v: Visita) => void
  addCliente: (c: Cliente) => void
  ultimaVisita: (rcIdx: number) => string | null
  diasSemVisita: (rcIdx: number) => number | null
  exportBackup: () => void
  importBackup: (data: AppState) => void
  resetData: () => void
}

export type PageId =
  | 'dashboard'
  | 'representantes'
  | 'agenda'
  | 'clientes'
  | 'relatorios'
  | 'mapa'
  | 'admin'
