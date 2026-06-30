// ============================================================
//  Configuração do Supabase (banco de dados na nuvem)
// ------------------------------------------------------------
//  PARA ATIVAR: preencha os dois valores abaixo com os dados do
//  projeto Supabase do dono (Supabase → Project Settings → API):
//    - SUPABASE_URL      = "Project URL"   (ex.: https://xxxx.supabase.co)
//    - SUPABASE_ANON_KEY = "anon public key"
//
//  Essa chave anon é PÚBLICA de propósito — pode ficar aqui no
//  repositório. A segurança é feita pelas políticas RLS do banco
//  (ver docs/sql/schema.sql).
//
//  Enquanto estiverem VAZIOS, o app roda em modo local (localStorage),
//  sem tela de login — exatamente como hoje.
// ============================================================

export const SUPABASE_URL = 'https://qywimgregwcygzxvjvnb.supabase.co'
export const SUPABASE_ANON_KEY = 'sb_publishable_PjDSrZRTL-9vLXNrphIiGw_X0AIwC5q'

/** True quando as credenciais do Supabase foram preenchidas acima. */
export const isSupabaseEnabled = (): boolean =>
  SUPABASE_URL.trim().length > 0 && SUPABASE_ANON_KEY.trim().length > 0
