import { useState } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Store } from '../../hooks/useStore'
import { Table, GRBadge, MTBadge, Btn, SectionHeader, Select } from '../ui'
import { fmtDate, gerarICS } from '../../lib/utils'
import { Visita } from '../../types'
import { useToast } from '../../hooks/useToast'

interface Props { store: Store }

const TIPO_LABEL: Record<string, string> = {
  representante: 'RC Comercial',
  supervisor: 'Supervisor',
  cliente_direto: 'Cliente Direto',
}

export default function Relatorios({ store }: Props) {
  const { toast } = useToast()
  const today = new Date()
  const [mesRef, setMesRef] = useState(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`)

  const visitas = [...store.state.visitas].sort((a, b) => b.data.localeCompare(a.data))

  const contato = (v: Visita) => {
    const rc = v.rcIdx != null ? store.state.rcs[v.rcIdx] : undefined
    return rc?.rc || v.clienteNome || '—'
  }
  const exportarICS = (v: Visita) => {
    const rc = v.rcIdx != null ? store.state.rcs[v.rcIdx] : undefined
    gerarICS(v, rc?.rc, rc?.razao)
  }

  const gerarPDF = () => {
    const doVisitas = visitas.filter(v => v.data.startsWith(mesRef))
    const doc = new jsPDF()
    const [ano, mes] = mesRef.split('-')
    const nomeMes = new Date(Number(ano), Number(mes) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    doc.setFontSize(16)
    doc.text('Relatório Mensal de Visitas', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Período: ${nomeMes}`, 14, 25)

    // Resumo
    const novos = doVisitas.reduce((s, v) => s + (v.novosClientes || 0), 0)
    doc.text(`Visitas realizadas: ${doVisitas.length}   |   Novos clientes: ${novos}`, 14, 31)

    autoTable(doc, {
      startY: 37,
      head: [['Data', 'Tipo', 'GR', 'MT', 'Contato', 'Rebanho', 'Obs']],
      body: doVisitas.map(v => [
        fmtDate(v.data),
        TIPO_LABEL[v.tipo] || v.tipo,
        v.gr, v.mt,
        contato(v),
        v.rebanho ? `${v.rebanho} cab.` : '—',
        v.obs || '',
      ]),
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [27, 107, 74] },
      columnStyles: { 6: { cellWidth: 50 } },
    })

    // RCs em foco
    const foco = store.state.rcs.filter(r => r.foco)
    if (foco.length) {
      const y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
      doc.setFontSize(11); doc.setTextColor(0)
      doc.text('RCs em Foco', 14, y)
      autoTable(doc, {
        startY: y + 3,
        head: [['RC', 'GR', 'MT', 'Nota RC']],
        body: foco.map(r => [r.rc, r.gr, r.mt, r.notaRC?.toFixed(2) ?? '—']),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [192, 122, 26] },
      })
    }

    doc.save(`relatorio_${mesRef}.pdf`)
    toast('PDF gerado ✓')
  }

  // opções de mês: do mais antigo registrado até hoje (ou só o atual)
  const meses = Array.from(new Set(visitas.map(v => v.data.slice(0, 7))))
  if (!meses.includes(mesRef)) meses.unshift(mesRef)
  meses.sort((a, b) => b.localeCompare(a))

  return (
    <div>
      <SectionHeader title="Relatórios de Visitas">
        <Select value={mesRef} onChange={e => setMesRef(e.target.value)} >
          {meses.map(m => {
            const [a, mm] = m.split('-')
            return <option key={m} value={m}>{new Date(Number(a), Number(mm) - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</option>
          })}
        </Select>
        <Btn variant="primary" size="sm" onClick={gerarPDF}>📄 Gerar PDF mensal</Btn>
      </SectionHeader>

      <Table headers={['Data', 'Tipo', 'GR', 'MT', 'Contato', 'Rebanho', 'Potencial', 'Observações', '']} empty={visitas.length === 0}>
        {visitas.map(v => (
          <tr key={v.id} className="border-b border-border last:border-0 hover:bg-surface">
            <td className="px-4 py-2.5 font-mono-dm text-[12px] text-ink whitespace-nowrap">{fmtDate(v.data)}</td>
            <td className="px-4 py-2.5 text-[12px] text-ink-mid whitespace-nowrap">{TIPO_LABEL[v.tipo] || v.tipo}</td>
            <td className="px-4 py-2.5"><GRBadge gr={v.gr} /></td>
            <td className="px-4 py-2.5">{v.mt ? <MTBadge mt={v.mt} /> : '—'}</td>
            <td className="px-4 py-2.5 font-semibold text-ink text-[12px]">{contato(v)}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{v.rebanho ? `${v.rebanho} cab.` : '—'}</td>
            <td className="px-4 py-2.5 font-mono-dm text-ink-mid text-[12px]">{v.potencial ? `${v.potencial} t` : '—'}</td>
            <td className="px-4 py-2.5 text-ink-light text-[12px] max-w-[240px] truncate" title={v.obs}>{v.obs || '—'}</td>
            <td className="px-4 py-2.5">
              <button onClick={() => exportarICS(v)} className="text-[11px] text-ink-light hover:text-accent font-mono-dm whitespace-nowrap">📤 ICS</button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
