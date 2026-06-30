import { useState } from 'react'
import { Store } from '../../hooks/useStore'
import { Table, MTBadge, Modal, Btn, Input, Select, Textarea, FormGroup, SectionHeader } from '../ui'
import { Cliente } from '../../types'
import { generateId, fmtDate } from '../../lib/utils'
import { useToast } from '../../hooks/useToast'

interface Props { store: Store }

const TIPOS_REBANHO = ['', 'Cria', 'Recria', 'Engorda', 'Confinamento', 'Misto']

function emptyCliente(): Cliente {
  return { id: '', nome: '', mt: '', rcIdx: null, tipo: '', size: 0, pot: 0, cidade: '', obs: '', ultimoContato: '' }
}

export default function Clientes({ store }: Props) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [f, setF] = useState<Cliente>(emptyCliente())
  const set = (p: Partial<Cliente>) => setF(prev => ({ ...prev, ...p }))

  const abrir = () => { setF(emptyCliente()); setOpen(true) }

  const rcsDaMt = store.state.rcs
    .map((rc, idx) => ({ rc, idx }))
    .filter(({ rc }) => !f.mt || rc.mt === f.mt)

  const salvar = () => {
    if (!f.nome) { toast('Informe o nome do cliente.'); return }
    store.addCliente({ ...f, id: generateId() })
    toast('Cliente cadastrado ✓')
    setOpen(false)
  }

  const nomeRC = (idx: number | null) => idx != null ? store.state.rcs[idx]?.rc ?? '—' : '—'

  return (
    <div>
      <SectionHeader title="Clientes / Rebanho">
        {!store.readOnly && <Btn variant="primary" size="sm" onClick={abrir}>+ Novo cliente</Btn>}
      </SectionHeader>

      <Table headers={['Nome', 'MT', 'RC vinculado', 'Tipo', 'Rebanho', 'Potencial', 'Cidade', 'Últ. contato']} empty={store.state.clientes.length === 0}>
        {store.state.clientes.map(c => (
          <tr key={c.id} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5 font-semibold text-ink">{c.nome}</td>
            <td className="px-4 py-2.5">{c.mt ? <MTBadge mt={c.mt} /> : '—'}</td>
            <td className="px-4 py-2.5 text-ink-mid text-[12px]">{nomeRC(c.rcIdx)}</td>
            <td className="px-4 py-2.5 text-ink-mid text-[12px]">{c.tipo || '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{c.size > 0 ? `${c.size} cab.` : '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{c.pot > 0 ? `${c.pot} t/mês` : '—'}</td>
            <td className="px-4 py-2.5 text-ink-mid text-[12px]">{c.cidade || '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-light text-[12px]">{c.ultimoContato ? fmtDate(c.ultimoContato) : '—'}</td>
          </tr>
        ))}
      </Table>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo cliente / rebanho"
        sub="Cadastro de produtor ou fazenda"
        footer={<>
          <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={salvar}>Salvar</Btn>
        </>}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="Nome *" full>
            <Input value={f.nome} onChange={e => set({ nome: e.target.value })} placeholder="Produtor / fazenda" />
          </FormGroup>
          <FormGroup label="MT">
            <Select value={f.mt} onChange={e => set({ mt: e.target.value, rcIdx: null })}>
              <option value="">—</option>
              {store.state.mts.map(m => <option key={`${m.gr}-${m.codigo}`} value={m.codigo}>{m.codigo} ({m.gr})</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="RC vinculado">
            <Select value={f.rcIdx ?? ''} onChange={e => set({ rcIdx: e.target.value === '' ? null : Number(e.target.value) })}>
              <option value="">—</option>
              {rcsDaMt.map(({ rc, idx }) => <option key={idx} value={idx}>{rc.rc}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Tipo de rebanho">
            <Select value={f.tipo} onChange={e => set({ tipo: e.target.value })}>
              {TIPOS_REBANHO.map(t => <option key={t} value={t}>{t || '—'}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Cidade">
            <Input value={f.cidade} onChange={e => set({ cidade: e.target.value })} />
          </FormGroup>
          <FormGroup label="Tamanho do rebanho (cabeças)">
            <Input type="number" min={0} value={f.size} onChange={e => set({ size: Number(e.target.value) })} />
          </FormGroup>
          <FormGroup label="Potencial de compra (ton/mês)">
            <Input type="number" min={0} step="0.1" value={f.pot} onChange={e => set({ pot: Number(e.target.value) })} />
          </FormGroup>
          <FormGroup label="Último contato">
            <Input type="date" value={f.ultimoContato} onChange={e => set({ ultimoContato: e.target.value })} />
          </FormGroup>
          <FormGroup label="Observações" full>
            <Textarea value={f.obs} onChange={e => set({ obs: e.target.value })} />
          </FormGroup>
        </div>
      </Modal>
    </div>
  )
}
