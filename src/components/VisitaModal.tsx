import { useState, useEffect } from 'react'
import { Modal, FormGroup, Input, Select, Textarea, Btn } from './ui'
import { Store } from '../hooks/useStore'
import { useToast } from '../hooks/useToast'
import { Visita, TipoVisita } from '../types'
import { generateId } from '../lib/utils'

interface Props {
  store: Store
  open: boolean
  onClose: () => void
  defaultDate?: string
  defaultRcIdx?: number | null
}

const TIPOS_REBANHO = ['', 'Cria', 'Recria', 'Engorda', 'Confinamento', 'Misto']
const NIVEIS = ['', '1', '2', '3', '4', '5']

function emptyForm(date?: string, rcIdx?: number | null): Visita {
  return {
    id: '',
    data: date || '',
    tipo: 'representante',
    gr: '',
    mt: '',
    rcIdx: rcIdx ?? null,
    novosClientes: 0,
    rebanho: 0,
    tipoRebanho: '',
    potencial: 0,
    nivelTec: '',
    proximo: '',
    obs: '',
    clienteNome: '',
  }
}

export function VisitaModal({ store, open, onClose, defaultDate, defaultRcIdx }: Props) {
  const { toast } = useToast()
  const [f, setF] = useState<Visita>(emptyForm(defaultDate, defaultRcIdx))

  // Quando abrir, semeia data/RC (e deriva GR/MT do RC se houver)
  useEffect(() => {
    if (!open) return
    let base = emptyForm(defaultDate, defaultRcIdx)
    if (defaultRcIdx != null && store.state.rcs[defaultRcIdx]) {
      const rc = store.state.rcs[defaultRcIdx]
      base = { ...base, gr: rc.gr, mt: rc.mt }
    }
    setF(base)
  }, [open, defaultDate, defaultRcIdx])

  const set = (patch: Partial<Visita>) => setF(prev => ({ ...prev, ...patch }))

  const mtsDaGr = store.state.mts.filter(m => m.gr === f.gr)
  const rcsOptions = store.state.rcs
    .map((rc, idx) => ({ rc, idx }))
    .filter(({ rc }) => (!f.gr || rc.gr === f.gr) && (!f.mt || rc.mt === f.mt))

  const submit = () => {
    if (!f.data) { toast('Informe a data da visita.'); return }
    if (f.tipo === 'representante' && f.rcIdx == null) { toast('Selecione o RC.'); return }
    store.addVisita({ ...f, id: generateId() })
    toast('Visita registrada ✓')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar Visita"
      sub="Preencha os dados da visita técnica"
      footer={
        <>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={submit}>Salvar visita</Btn>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <FormGroup label="Data da visita *">
          <Input type="date" value={f.data} onChange={e => set({ data: e.target.value })} />
        </FormGroup>

        <FormGroup label="Tipo">
          <Select value={f.tipo} onChange={e => set({ tipo: e.target.value as TipoVisita, rcIdx: null })}>
            <option value="representante">Representante Comercial</option>
            <option value="supervisor">Supervisor</option>
            <option value="cliente_direto">Cliente Direto</option>
          </Select>
        </FormGroup>

        <FormGroup label="GR">
          <Select value={f.gr} onChange={e => set({ gr: e.target.value, mt: '', rcIdx: null })}>
            <option value="">—</option>
            {store.state.grs.map(g => <option key={g.codigo} value={g.codigo}>{g.codigo}</option>)}
          </Select>
        </FormGroup>

        <FormGroup label="MT">
          <Select value={f.mt} onChange={e => set({ mt: e.target.value, rcIdx: null })} disabled={!f.gr}>
            <option value="">—</option>
            {mtsDaGr.map(m => <option key={m.codigo} value={m.codigo}>{m.codigo}</option>)}
          </Select>
        </FormGroup>

        {f.tipo === 'representante' && (
          <FormGroup label="RC / Contato" full>
            <Select value={f.rcIdx ?? ''} onChange={e => set({ rcIdx: e.target.value === '' ? null : Number(e.target.value) })}>
              <option value="">—</option>
              {rcsOptions.map(({ rc, idx }) => (
                <option key={idx} value={idx}>{rc.rc} — {rc.razao}</option>
              ))}
            </Select>
          </FormGroup>
        )}

        {f.tipo === 'cliente_direto' && (
          <FormGroup label="Nome do cliente" full>
            <Input value={f.clienteNome} onChange={e => set({ clienteNome: e.target.value })} placeholder="Produtor / fazenda" />
          </FormGroup>
        )}

        <FormGroup label="Novos clientes">
          <Input type="number" min={0} value={f.novosClientes} onChange={e => set({ novosClientes: Number(e.target.value) })} />
        </FormGroup>

        <FormGroup label="Rebanho (cabeças)">
          <Input type="number" min={0} value={f.rebanho} onChange={e => set({ rebanho: Number(e.target.value) })} />
        </FormGroup>

        <FormGroup label="Tipo de rebanho">
          <Select value={f.tipoRebanho} onChange={e => set({ tipoRebanho: e.target.value })}>
            {TIPOS_REBANHO.map(t => <option key={t} value={t}>{t || '—'}</option>)}
          </Select>
        </FormGroup>

        <FormGroup label="Potencial (ton/mês)">
          <Input type="number" min={0} step="0.1" value={f.potencial} onChange={e => set({ potencial: Number(e.target.value) })} />
        </FormGroup>

        <FormGroup label="Nível tecnológico (1-5)">
          <Select value={f.nivelTec} onChange={e => set({ nivelTec: e.target.value })}>
            {NIVEIS.map(n => <option key={n} value={n}>{n || '—'}</option>)}
          </Select>
        </FormGroup>

        <FormGroup label="Próximo contato">
          <Input type="date" value={f.proximo} onChange={e => set({ proximo: e.target.value })} />
        </FormGroup>

        <FormGroup label="Observações" full>
          <Textarea value={f.obs} onChange={e => set({ obs: e.target.value })} placeholder="Demandas técnicas, pontos de atenção..." />
        </FormGroup>
      </div>
    </Modal>
  )
}
