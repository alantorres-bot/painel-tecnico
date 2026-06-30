import { RC } from '../types'

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function fmtDate(s: string): string {
  if (!s) return '—'
  return new Date(s + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function notaClass(n: number | null): 'alto' | 'medio' | 'baixo' | '' {
  if (n === null) return ''
  if (n >= 3) return 'alto'
  if (n >= 1.5) return 'medio'
  return 'baixo'
}

export function notaColor(n: number | null): string {
  if (n === null) return '#A8B8B3'
  if (n >= 3) return '#1B6B4A'
  if (n >= 1.5) return '#C07A1A'
  return '#B83232'
}

export function statusLabel(n: number | null): string {
  if (n === null) return 'Sem dados'
  if (n >= 3) return '🟢 Bom'
  if (n >= 1.5) return '🟡 Atenção'
  return '🔴 Crítico'
}

export function grBadgeClass(gr: string): string {
  if (gr === 'GR6') return 'bg-accent-lt text-accent'
  if (gr === 'GR7') return 'bg-blue-100 text-blue-800'
  return 'bg-purple-100 text-purple-800'
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function gerarICS(v: {
  data: string
  tipo: string
  gr: string
  mt: string
  obs?: string
  rebanho?: number
  tipoRebanho?: string
  potencial?: number
  clienteNome?: string
}, rcNome?: string, rcRazao?: string) {
  const tipoMap: Record<string, string> = {
    representante: 'RC Comercial',
    supervisor: 'Supervisor',
    cliente_direto: 'Cliente Direto',
  }
  const titulo = rcNome
    ? `Visita Técnica — ${rcNome} (${v.mt})`
    : v.clienteNome
    ? `Visita Técnica — ${v.clienteNome}`
    : 'Visita Técnica'

  const desc = [
    `Tipo: ${tipoMap[v.tipo] || v.tipo}`,
    `GR: ${v.gr} | MT: ${v.mt}`,
    rcNome ? `RC: ${rcNome}` : '',
    rcRazao ? `Empresa: ${rcRazao}` : '',
    v.obs ? `Obs: ${v.obs}` : '',
    v.rebanho ? `Rebanho: ${v.rebanho} cab. ${v.tipoRebanho || ''}` : '',
    v.potencial ? `Potencial: ${v.potencial} ton/mês` : '',
  ].filter(Boolean).join('\\n')

  const dt = v.data.replace(/-/g, '')
  const uid = `visita-${dt}-${generateId()}@paineltecnico`
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Painel Supervisao Tecnica Facholi//PT//PT',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;VALUE=DATE:${dt}`,
    `DTEND;VALUE=DATE:${dt}`,
    `SUMMARY:${titulo}`,
    `DESCRIPTION:${desc}`,
    'STATUS:CONFIRMED',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `visita_${v.data}_${(rcNome || v.clienteNome || 'visita').replace(/\s+/g, '_')}.ics`
  a.click()
}

export const CIDADES_COORDS: Record<string, { lat: number; lng: number }> = {
  'sinop': { lat: -11.865, lng: -55.507 },
  'sorriso': { lat: -12.544, lng: -55.721 },
  'lucas do rio verde': { lat: -13.056, lng: -55.913 },
  'colider': { lat: -10.813, lng: -55.451 },
  'guarantã do norte': { lat: -9.795, lng: -54.901 },
  'juara': { lat: -11.267, lng: -57.524 },
  'colniza': { lat: -9.394, lng: -59.005 },
  'brasnorte': { lat: -12.148, lng: -57.993 },
  'aripuanã': { lat: -9.167, lng: -60.633 },
  'porto dos gaúchos': { lat: -11.551, lng: -57.401 },
  'castanheira': { lat: -11.133, lng: -58.283 },
  'nova canaã': { lat: -9.967, lng: -55.683 },
  'novo progresso': { lat: -7.154, lng: -55.381 },
  'castelo dos sonhos': { lat: -8.178, lng: -55.076 },
  'nova união do sul': { lat: -11.527, lng: -54.319 },
  'cuiabá': { lat: -15.601, lng: -56.097 },
  'rondonópolis': { lat: -16.470, lng: -54.638 },
  'alta floresta': { lat: -9.875, lng: -56.088 },
  'comodoro': { lat: -13.656, lng: -59.786 },
  'cáceres': { lat: -16.071, lng: -57.679 },
  'tangará da serra': { lat: -14.621, lng: -57.491 },
  'campos de júlio': { lat: -13.534, lng: -59.277 },
  'diamantino': { lat: -14.407, lng: -56.445 },
  'paranatinga': { lat: -14.430, lng: -54.051 },
  'barra do garças': { lat: -15.890, lng: -52.257 },
  'primavera do leste': { lat: -15.559, lng: -54.282 },
  'água boa': { lat: -14.023, lng: -52.159 },
  'canarana': { lat: -13.540, lng: -52.270 },
  'querência': { lat: -12.607, lng: -52.183 },
  'peixoto de azevedo': { lat: -10.223, lng: -54.981 },
  'nova mutum': { lat: -13.833, lng: -56.083 },
  'conselvan': { lat: -11.5, lng: -57.8 },
}

export function getCoordsForRC(rc: RC): { lat: number; lng: number } | null {
  if (!rc.cidade) return null
  const key = rc.cidade.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const [k, v] of Object.entries(CIDADES_COORDS)) {
    const kn = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (kn === key || key.includes(kn) || kn.includes(key)) return v
  }
  return null
}
