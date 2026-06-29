import { ReactNode } from 'react'
import { notaClass } from '../../lib/utils'

// ── NotaBar ──────────────────────────────────────────────
export function NotaBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-ink-faint font-mono-dm text-xs">—</span>
  const pct = Math.min(100, (value / 5) * 100)
  const cls = notaClass(value)
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1 bg-field rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${cls === 'alto' ? 'bg-accent-md' : cls === 'medio' ? 'bg-amber' : 'bg-danger'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono-dm text-[12px] text-ink-mid font-medium">{value.toFixed(1)}</span>
    </div>
  )
}

// ── StatusBadge ───────────────────────────────────────────
export function StatusBadge({ nota }: { nota: number | null }) {
  if (nota === null) return <span className="badge bmt">Sem dados</span>
  if (nota >= 3) return <span className="px-2 py-0.5 rounded-full bg-accent-lt text-accent text-[11px] font-semibold font-mono-dm">🟢 Bom</span>
  if (nota >= 1.5) return <span className="px-2 py-0.5 rounded-full bg-amber-lt text-amber text-[11px] font-semibold font-mono-dm">🟡 Atenção</span>
  return <span className="px-2 py-0.5 rounded-full bg-danger-lt text-danger text-[11px] font-semibold font-mono-dm">🔴 Crítico</span>
}

// ── GRBadge ───────────────────────────────────────────────
export function GRBadge({ gr }: { gr: string }) {
  const cls = gr === 'GR6'
    ? 'bg-accent-lt text-accent'
    : gr === 'GR7'
    ? 'bg-blue-100 text-blue-800'
    : 'bg-purple-100 text-purple-800'
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono-dm tracking-wide ${cls}`}>
      {gr}
    </span>
  )
}

// ── MTBadge ───────────────────────────────────────────────
export function MTBadge({ mt }: { mt: string }) {
  return (
    <span className="px-2 py-0.5 rounded-full bg-field text-ink-mid border border-border text-[11px] font-semibold font-mono-dm tracking-wide">
      {mt}
    </span>
  )
}

// ── Button ────────────────────────────────────────────────
interface BtnProps {
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  className?: string
}

export function Btn({ onClick, children, variant = 'primary', size = 'md', type = 'button', className = '' }: BtnProps) {
  const base = 'inline-flex items-center gap-1.5 font-semibold rounded-md transition-all duration-100 cursor-pointer'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-[13px]' }
  const variants = {
    primary: 'bg-accent text-white border-none hover:bg-accent-md',
    secondary: 'bg-card text-accent border border-border-md hover:bg-accent hover:text-white hover:border-accent',
    danger: 'bg-card text-danger border border-danger-lt hover:bg-danger hover:text-white',
    ghost: 'bg-field text-ink-mid border border-border hover:bg-ink hover:text-white hover:border-ink',
  }
  return (
    <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}

// ── Card ──────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-[10px] border border-border overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className={`bg-card rounded-[10px] border border-border p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent ? 'bg-accent-md' : 'bg-border'}`} />
      <div className="font-mono-dm text-[10px] tracking-widest uppercase text-ink-light mb-2.5">{label}</div>
      <div className={`font-display text-[34px] font-black leading-none tracking-tight ${accent ? 'text-accent' : 'text-ink'}`}>
        {value}
      </div>
      {sub && <div className="text-[11.5px] text-ink-faint mt-1.5">{sub}</div>}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────
export function Table({ headers, children, empty }: { headers: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="bg-card rounded-[10px] border border-border overflow-hidden mb-5">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} className="bg-surface px-4 py-2.5 text-left font-mono-dm text-[10px] tracking-widest uppercase text-ink-light border-b border-border">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty && (
        <div className="text-center py-12 text-ink-faint">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-[13px]">Nenhum item cadastrado</p>
        </div>
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  sub?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'sm'
}

export function Modal({ open, onClose, title, sub, children, footer, size = 'md' }: ModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-ink/55 z-50 flex items-center justify-center backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`bg-card rounded-[14px] shadow-2xl max-h-[90vh] overflow-y-auto ${size === 'sm' ? 'w-[460px]' : 'w-[640px]'}`}>
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border">
          <div>
            <h3 className="font-display text-[18px] font-bold text-ink tracking-tight">{title}</h3>
            {sub && <div className="text-[12px] text-ink-light mt-0.5">{sub}</div>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md bg-field border border-border text-ink-mid hover:bg-border text-sm flex-shrink-0 mt-0.5">✕</button>
        </div>
        <div className="px-7 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 px-7 pb-5 pt-4 border-t border-border">{footer}</div>}
      </div>
    </div>
  )
}

// ── FormGroup ─────────────────────────────────────────────
export function FormGroup({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <label className="block font-mono-dm text-[10.5px] tracking-widest uppercase text-ink-light mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// ── Input / Select / Textarea ─────────────────────────────
const inputCls = 'w-full border border-border rounded-md px-3 py-2 text-[13px] font-sans text-ink bg-card focus:outline-none focus:border-accent-md focus:ring-2 focus:ring-accent-md/10 transition-all'

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={inputCls} />
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-y min-h-[80px]`} />
}

// ── SectionHeader ─────────────────────────────────────────
export function SectionHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <h2 className="font-display text-[15px] font-bold text-ink tracking-tight">{title}</h2>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────
export function EmptyState({ icon, title, description }: { icon: string; title: string; description?: string }) {
  return (
    <div className="text-center py-12 px-5 text-ink-faint">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-[14px] font-semibold text-ink-mid mb-1">{title}</h3>
      {description && <p className="text-[12.5px]">{description}</p>}
    </div>
  )
}
