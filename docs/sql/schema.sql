-- ============================================================
-- Painel de Supervisão Técnica Facholi — esquema do banco
-- Banco: Supabase (PostgreSQL)
-- Como rodar: no projeto Supabase → menu lateral "SQL Editor"
--             → New query → cole TUDO isto → Run.
-- Modelo de acesso: cada usuário (login) enxerga e edita SOMENTE
--                   os próprios dados (RLS por owner = auth.uid()).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Gerências Regionais ----------
create table if not exists grs (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  codigo     text not null,
  nome       text default '',
  created_at timestamptz default now()
);

-- ---------- Microrregiões (MTs) ----------
create table if not exists mts (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users(id) on delete cascade,
  gr         text not null,
  codigo     text not null,
  nome       text default '',
  created_at timestamptz default now()
);

-- ---------- Representantes Comerciais ----------
create table if not exists rcs (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  gr          text not null,
  mt          text not null,
  rc          text not null,
  razao       text default '',
  nota_rc     numeric,
  nota_regiao numeric,
  nota_log    numeric,
  vol         numeric default 0,
  cidade      text default '',
  foco        boolean default false,
  created_at  timestamptz default now()
);

-- ---------- Visitas ----------
create table if not exists visitas (
  id             uuid primary key default gen_random_uuid(),
  owner          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data           date not null,
  tipo           text not null,              -- representante | supervisor | cliente_direto
  gr             text default '',
  mt             text default '',
  rc_id          uuid references rcs(id) on delete set null,
  novos_clientes int default 0,
  rebanho        int default 0,
  tipo_rebanho   text default '',
  potencial      numeric default 0,
  nivel_tec      text default '',
  proximo        date,
  obs            text default '',
  cliente_nome   text default '',
  created_at     timestamptz default now()
);

-- ---------- Clientes / Rebanho ----------
create table if not exists clientes (
  id             uuid primary key default gen_random_uuid(),
  owner          uuid not null default auth.uid() references auth.users(id) on delete cascade,
  nome           text not null,
  mt             text default '',
  rc_id          uuid references rcs(id) on delete set null,
  tipo           text default '',
  size           int default 0,
  pot            numeric default 0,
  cidade         text default '',
  obs            text default '',
  ultimo_contato date,
  created_at     timestamptz default now()
);

-- ============================================================
-- RLS (Row Level Security): isola os dados por usuário
-- ============================================================
alter table grs      enable row level security;
alter table mts      enable row level security;
alter table rcs      enable row level security;
alter table visitas  enable row level security;
alter table clientes enable row level security;

create policy "own grs"      on grs      for all using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own mts"      on mts      for all using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own rcs"      on rcs      for all using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own visitas"  on visitas  for all using (owner = auth.uid()) with check (owner = auth.uid());
create policy "own clientes" on clientes for all using (owner = auth.uid()) with check (owner = auth.uid());

-- Pronto. As tabelas começam vazias; o app cuida de semear os
-- GRs/MTs/RCs iniciais (ou importar a planilha) no primeiro login.

-- ============================================================
-- IMPORTANTE: depois deste schema, rode também **docs/sql/roles.sql**.
-- Ele adiciona papéis (supervisor/gerente) e TROCA as policies acima
-- por: gerente LÊ tudo, só o dono ESCREVE. Sem o roles.sql, o app
-- funciona em modo monousuário (cada um só vê o próprio dado).
-- ============================================================
