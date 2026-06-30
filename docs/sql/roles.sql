-- ============================================================
-- Painel de Supervisão Técnica Facholi — Papéis e Hierarquia
-- Roda no Supabase → SQL Editor → New query → cole TUDO → Run.
-- (Pode rodar mais de uma vez: é idempotente.)
--
-- Papéis: 'supervisor' (padrão) e 'gerente'.
--  - supervisor: vê/edita só os próprios dados (como hoje).
--  - gerente: LÊ os dados de todos os supervisores (consolidado +
--    drill-down), mas NÃO edita dado de terceiros.
-- ============================================================

-- ---------- Tabela de perfis (papel por usuário) ----------
create table if not exists profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null default 'supervisor' check (role in ('supervisor', 'gerente')),
  nome       text default '',
  email      text default '',
  created_by uuid,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- ---------- Função anti-recursão p/ usar nas policies ----------
-- security definer → roda como dono e ignora a RLS de profiles,
-- evitando recursão quando usada nas policies das outras tabelas.
create or replace function public.is_gerente()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where user_id = auth.uid() and role = 'gerente'
  );
$$;

revoke all on function public.is_gerente() from public;
grant execute on function public.is_gerente() to authenticated;

-- ---------- Policies de profiles ----------
-- Leitura: o próprio perfil (predicado DIRETO, nunca subquery em
-- profiles) OU qualquer perfil se for gerente.
drop policy if exists "self read profile" on profiles;
create policy "self read profile" on profiles
  for select using (user_id = auth.uid());

drop policy if exists "gerente read profiles" on profiles;
create policy "gerente read profiles" on profiles
  for select using (public.is_gerente());

-- Atualização: o próprio perfil (ex.: nome). A troca de 'role' é
-- bloqueada pelo trigger abaixo, exceto para gerentes.
drop policy if exists "self update profile" on profiles;
create policy "self update profile" on profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "gerente update profiles" on profiles;
create policy "gerente update profiles" on profiles
  for update using (public.is_gerente()) with check (public.is_gerente());

-- (Sem policy de INSERT/DELETE pelo client: perfis nascem via trigger
--  on_auth_user_created; gestão de papéis é do gerente/admin.)

-- ---------- Trigger anti-escalonamento de papel ----------
create or replace function public.guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_gerente() then
    raise exception 'Apenas gerentes podem alterar o papel de um usuário.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_role_change on profiles;
create trigger trg_guard_role_change
  before update on profiles
  for each row execute function public.guard_role_change();

-- ---------- Trigger: cria profile a cada novo usuário ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, email, role)
  values (new.id, new.email, 'supervisor')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Backfill: perfis p/ usuários já existentes ----------
insert into public.profiles (user_id, email, role)
select id, email, 'supervisor' from auth.users
on conflict (user_id) do nothing;

-- ============================================================
-- RLS das 5 tabelas de dados: gerente LÊ tudo; só o dono ESCREVE.
-- Substitui a policy única "own ..." (for all) do schema.sql.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['grs','mts','rcs','visitas','clientes'] loop
    execute format('drop policy if exists "own %1$s" on %1$s', t);
    execute format('drop policy if exists "read own or gerente" on %1$s', t);
    execute format('drop policy if exists "insert own" on %1$s', t);
    execute format('drop policy if exists "update own" on %1$s', t);
    execute format('drop policy if exists "delete own" on %1$s', t);

    execute format($f$create policy "read own or gerente" on %1$s
      for select using (owner = auth.uid() or public.is_gerente())$f$, t);
    execute format($f$create policy "insert own" on %1$s
      for insert with check (owner = auth.uid())$f$, t);
    execute format($f$create policy "update own" on %1$s
      for update using (owner = auth.uid()) with check (owner = auth.uid())$f$, t);
    execute format($f$create policy "delete own" on %1$s
      for delete using (owner = auth.uid())$f$, t);
  end loop;
end $$;

-- ============================================================
-- BOOTSTRAP DO 1º GERENTE (manual — rodar quando a conta existir):
--   update public.profiles set role = 'gerente'
--   where user_id = (select id from auth.users where email = 'EMAIL_DO_GERENTE');
-- ============================================================
