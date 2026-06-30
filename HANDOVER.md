# Guia do Dono — Painel de Supervisão Técnica Facholi

Este guia é para quem vai **usar e manter** o app por conta própria.

- **Site no ar:** https://alantorres-bot.github.io/painel-tecnico/
- **Código (GitHub):** https://github.com/alantorres-bot/painel-tecnico
- **Tecnologia:** React + TypeScript + Vite + Tailwind. Mapa em Leaflet.

> Hoje os dados ficam só no navegador (localStorage). A seção **“Banco de dados na
> nuvem (Supabase)”** abaixo explica como ativar o banco para não perder dados e usar
> em qualquer aparelho.

---

## 1. Como editar o app você mesmo (com o seu Claude Code)

1. Instale o **Git** e o **Node.js 20+**.
2. Tenha o **Claude Code** (a sua própria conta/assinatura — é por pessoa).
3. Pegue acesso ao repositório (veja a seção 3) e clone:
   ```bash
   git clone https://github.com/alantorres-bot/painel-tecnico.git
   cd painel-tecnico
   npm install
   npm run dev        # abre em http://localhost:5173
   ```
4. Abra o **Claude Code dentro dessa pasta** e peça as mudanças em português
   (“muda a cor do botão”, “adiciona um campo X na visita”, etc.).
5. Quando gostar do resultado, publique:
   ```bash
   git add -A
   git commit -m "minha mudança"
   git push
   ```
   O site **se republica sozinho** em 1–2 min (GitHub Actions → GitHub Pages).

---

## 2. Como rodar e publicar manualmente

```bash
npm run dev      # desenvolvimento (localhost)
npm run build    # gera a pasta dist/ (o deploy automático já faz isso)
```
O deploy é automático a cada `git push` na branch `main` (arquivo
`.github/workflows/deploy.yml`). Não precisa subir nada à mão.

---

## 3. Como obter acesso / virar dono do repositório

Escolha um dos caminhos com o Alan:

- **Ser colaborador:** o Alan vai em **Settings → Collaborators** do repositório e te
  convida pelo seu usuário do GitHub. Você passa a poder dar `push`.
- **Virar dono (transferência):** o Alan vai em **Settings → General → Danger Zone →
  Transfer ownership** e transfere o repo para a sua conta. Aí o site passa a ser
  `SEU-USUARIO.github.io/painel-tecnico/` (você ativa o Pages em **Settings → Pages →
  Source: GitHub Actions**).

---

## 4. Banco de dados na nuvem (Supabase) — para não perder dados

Isto coloca os dados na nuvem, com login, acessível de qualquer dispositivo.
**Você (dono) cria o projeto na sua conta**, assim os dados são seus.

1. Crie conta em **https://supabase.com** (tem plano grátis).
2. **New project** → escolha um nome e uma senha de banco → região
   **South America (São Paulo)**.
3. Quando abrir, vá em **SQL Editor → New query**, cole TODO o conteúdo de
   **`docs/sql/schema.sql`** (está neste repositório) e clique **Run**.
4. Vá em **Project Settings → API** e copie:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key** (uma chave longa — pode ficar no código, é pública de propósito;
     a segurança é feita pelas políticas RLS do banco).
5. Em **Authentication → Providers → Email**, deixe **Email** ligado. Para uso pessoal,
   pode **desligar “Confirm email”** (login direto sem confirmação). Crie o seu usuário em
   **Authentication → Users → Add user** (e-mail + senha).
6. **Cole as credenciais no código:** abra **`src/lib/config.ts`** e preencha:
   ```ts
   export const SUPABASE_URL = 'https://xxxx.supabase.co'
   export const SUPABASE_ANON_KEY = 'sua-anon-key'
   ```
   Faça `git push`. **Isso liga a tela de login** automaticamente (o app já está preparado:
   cliente do Supabase + login + botão Sair).

> ⚠️ **Etapa final (migração dos dados):** preencher o `config.ts` ativa o **login**, mas
> a troca da gravação de dados (hoje em localStorage) para o banco Supabase é o último
> passo e precisa ser feito com o banco já criado — peça ao seu Claude Code:
> *“migre o useStore para o Supabase usando o schema em docs/sql/schema.sql”*. O schema
> (tabelas + RLS) já está pronto no repositório.

> Enquanto o `config.ts` estiver vazio, o app funciona normalmente em modo local
> (localStorage) — e dá para **exportar/importar backup em JSON** na tela
> **Administração → Dados**.

---

## 5. Boas práticas

- **Antes de mudanças grandes**, faça um backup: Administração → Dados → Exportar Backup.
- **Confidencialidade:** o repositório é público e o site também — não coloque dados
  sensíveis que não possam ser vistos por terceiros enquanto estiver público.
- Para suporte, descreva o que quer ao seu Claude Code apontando para esta pasta.
