// Edge Function: create-supervisor
// Cria uma conta de SUPERVISOR. Só pode ser chamada por um GERENTE.
// A chave de admin (service_role) fica só aqui no servidor — nunca no app.
//
// Variáveis SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY são
// injetadas automaticamente pelo Supabase em toda Edge Function.
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json(405, { error: 'Método não permitido' })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''

    // 1) Identifica quem chamou (usando o token do próprio usuário)
    const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: userErr } = await caller.auth.getUser()
    if (userErr || !userData?.user) return json(401, { error: 'Não autenticado.' })

    // 2) Revalida no servidor que o chamador é GERENTE
    const { data: prof } = await caller
      .from('profiles').select('role').eq('user_id', userData.user.id).single()
    if (prof?.role !== 'gerente') return json(403, { error: 'Apenas o gerente pode criar usuários.' })

    // 3) Lê e valida o corpo
    const { email, password, nome } = await req.json().catch(() => ({}))
    if (!email || !password) return json(400, { error: 'Informe e-mail e senha.' })
    if (String(password).length < 6) return json(400, { error: 'A senha precisa ter ao menos 6 caracteres.' })

    // 4) Cria o usuário com a chave de admin (service_role)
    const admin = createClient(url, service)
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    })
    if (createErr || !created?.user) {
      const msg = (createErr?.message || '').toLowerCase()
      if (msg.includes('already') || msg.includes('exist')) return json(409, { error: 'Já existe um usuário com esse e-mail.' })
      return json(400, { error: createErr?.message || 'Falha ao criar usuário.' })
    }

    // 5) O profile já é criado pelo trigger (role 'supervisor'); completa nome/created_by
    await admin.from('profiles')
      .update({ nome: nome ?? '', created_by: userData.user.id })
      .eq('user_id', created.user.id)

    return json(200, { ok: true, user_id: created.user.id, email })
  } catch (e) {
    return json(500, { error: String(e) })
  }
})
