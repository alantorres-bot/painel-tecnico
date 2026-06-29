# CLAUDE.md — Instruções para o Claude Code

## Sobre o projeto

Painel de gestão técnica de campo para supervisor zootecnista.
React 18 + TypeScript + Vite + Tailwind CSS.

## Como rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera pasta dist/
```

## Arquitetura

- **Estado global**: `src/hooks/useStore.ts` — hook com localStorage
- **Tipos**: `src/types/index.ts`
- **Dados iniciais**: `src/data/initial.ts` (37 RCs da planilha original)
- **Utilitários**: `src/lib/utils.ts` (formatação, ICS, coordenadas do mapa)
- **UI**: `src/components/ui/index.tsx` — todos os componentes reutilizáveis

## Convenções

- Componentes de página recebem `store` como prop (retorno do useStore)
- Tailwind para estilos — usar as cores do tema (accent, ink, amber, danger, surface)
- Fonte display: `font-display` (Fraunces), mono: `font-mono-dm` (DM Mono)
- IDs únicos gerados com `generateId()` de `lib/utils`

## Páginas a implementar / completar

Cada página está em `src/components/pages/`:

- `Dashboard.tsx` — cards de stats + tabela por MT + top RCs
- `Representantes.tsx` — tabela com filtros + modal de detalhes
- `Agenda.tsx` — calendário mensal + lista de próximas visitas
- `Clientes.tsx` — tabela + modal de cadastro
- `Relatorios.tsx` — tabela de visitas + botão gerar PDF
- `Mapa.tsx` — Leaflet + marcadores coloridos
- `Admin.tsx` — abas GRs / MTs / Representantes / Dados

## Próximo passo principal

Integrar Firebase:
1. `npm install firebase`
2. Criar `src/lib/firebase.ts` com config
3. Substituir localStorage por Firestore em `useStore.ts`
4. Adicionar autenticação em `App.tsx`

## Design tokens principais

```
bg-ink         = #0F1714 (sidebar)
bg-accent      = #1B6B4A (verde primário)
bg-accent-md   = #2A9068 (hover)
bg-accent-lt   = #D6EFE6 (badge bom)
bg-amber       = #C07A1A (atenção)
bg-danger      = #B83232 (crítico)
bg-surface     = #F7F9F8 (fundo)
bg-field       = #EEF4F2 (inputs)
border-border  = #E2ECEA
```
