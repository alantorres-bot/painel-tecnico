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

export type PageId =
  | 'dashboard'
  | 'representantes'
  | 'agenda'
  | 'clientes'
  | 'relatorios'
  | 'mapa'
  | 'admin'
