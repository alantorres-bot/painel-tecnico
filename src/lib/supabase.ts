import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseEnabled } from './config'

// Cliente do Supabase. Fica `null` enquanto as credenciais não forem
// preenchidas em config.ts — nesse caso o app continua em modo local.
export const supabase: SupabaseClient | null = isSupabaseEnabled()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
