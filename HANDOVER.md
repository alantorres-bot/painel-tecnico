# Guia do Dono — Painel de Supervisão Técnica Facholi

Este guia é para quem vai **usar e manter** o app por conta própria.

- **Site no ar:** https://alantorres-bot.github.io/painel-tecnico/
- **Código (GitHub):** https://github.com/alantorres-bot/painel-tecnico
- **Tecnologia:** React + TypeScript + Vite + Tailwind. Mapa em Leaflet.
- **Banco:** Supabase (nuvem) — **já ativo**. Login por e‑mail/senha; dados isolados por usuário.

> ✅ O banco na nuvem **já está ligado** (projeto Supabase `qywimgregwcygzxvjvnb`, na conta
> dhonesandrade2@gmail.com). Os dados ficam na nuvem e aparecem em qualquer aparelho após
> login. A seção 4 explica como **criar novos usuários** e gerenciar o banco.

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

## 4. Banco de dados na nuvem (Supabase) — JÁ ATIVO

O banco já está ligado: projeto **`qywimgregwcygzxvjvnb`** na conta
**dhonesandrade2@gmail.com** (https://supabase.com). Os dados ficam na nuvem, isolados por
usuário (RLS), e cada pessoa só vê os próprios. As credenciais públicas estão em
`src/lib/config.ts` (a *publishable key* é pública de propósito — a segurança é o RLS).

**Como criar acesso para mais alguém usar o app:**
1. Entre no Supabase → projeto → **Authentication → Users → Add user → Create new user**.
2. Informe e‑mail + senha e deixe **“Auto confirm user”** marcado. Pronto — essa pessoa já
   entra no app com esse login (e terá os dados dela, separados).

> 🔒 O **cadastro público está desligado** (Authentication → Sign In / Providers → “Allow new
> users to sign up” = off). Ou seja, ninguém cria conta sozinho pela URL — só você cria
> usuários pelo painel do Supabase. Para reativar o cadastro aberto, é só religar o toggle.

**Estrutura do banco:** está em `docs/sql/schema.sql` (tabelas grs/mts/rcs/visitas/clientes
+ RLS). Se um dia recriar o banco do zero, rode esse SQL no **SQL Editor**.

**Trocar para a conta Supabase de outra pessoa (transferência):** crie o projeto na conta
nova, rode `docs/sql/schema.sql`, e troque a URL + a *publishable key* em `src/lib/config.ts`
→ `git push`. (Ou peça ao seu Claude Code.)

> Backup manual a qualquer momento: **Administração → Dados → Exportar Backup (JSON)** —
> e dá para restaurar com **Importar Backup**.

---

## 5. Boas práticas

- **Antes de mudanças grandes**, faça um backup: Administração → Dados → Exportar Backup.
- **Confidencialidade:** o repositório é público e o site também — não coloque dados
  sensíveis que não possam ser vistos por terceiros enquanto estiver público.
- Para suporte, descreva o que quer ao seu Claude Code apontando para esta pasta.
