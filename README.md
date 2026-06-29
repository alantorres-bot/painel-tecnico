# Painel Técnico de Campo

Sistema de gestão de visitas técnicas para supervisores zootecnistas.

## Stack

- **React 18** + **TypeScript**
- **Vite** (build)
- **Tailwind CSS** (estilo)
- **Leaflet** (mapa)
- **SheetJS** (importar Excel)
- **jsPDF** (relatório PDF)
- **localStorage** (persistência local)

## Fontes

- **Fraunces** — títulos e números
- **DM Sans** — corpo
- **DM Mono** — labels, badges, dados

## Funcionalidades

- Dashboard com estatísticas por GR e MT
- Gestão de Representantes Comerciais com estrela de foco
- Alerta de dias sem visita (amarelo >30d, vermelho >60d)
- Agenda com calendário e exportação para Google Calendar / Outlook (.ics)
- Cadastro de Clientes e Rebanho
- Relatório em PDF
- Mapa interativo com marcadores por desempenho
- Administração completa: CRUD de GRs, MTs e RCs
- Importação de planilha Excel
- Backup e restauração em JSON

## Como rodar

```bash
npm install
npm run dev
```

## Como fazer build

```bash
npm run build
```

## Estrutura

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── types/         # TypeScript interfaces
├── data/          # Dados iniciais dos RCs
├── hooks/         # useStore (estado global) + useToast
├── lib/           # Utilitários, coords do mapa, geração de ICS
└── components/
    ├── ui/        # Componentes reutilizáveis (Button, Modal, Table...)
    ├── layout/    # Sidebar
    └── pages/     # Dashboard, Representantes, Agenda, etc.
```

## Importar planilha Excel

A planilha deve ter as colunas:

| Região | Supervisão | RC | Razão Social | Nota (RC) | Nota (Região) | Nota (Logística) | Volume Vendido (ton) | Cidade Base |

## Próximos passos

- [ ] Integração com Firebase (autenticação + dados na nuvem)
- [ ] Painel do gerente com visão consolidada
- [ ] PWA para uso offline em campo

## Desenvolvido com

Claude (Anthropic) — Junho 2026
