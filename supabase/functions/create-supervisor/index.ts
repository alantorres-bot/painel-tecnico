// Edge Function: create-supervisor (gestão de usuários)
// Só pode ser chamada por um GERENTE. A chave service_role fica só aqui no
// servidor (env var injetada pelo Supabase) — nunca no app.
//
// Ações (campo "action" no corpo):
//   create          -> cria supervisor { email, password, nome }
//   set_role        -> muda papel       { user_id, role: 'supervisor'|'gerente' }
//   set_active      -> ativa/desativa    { user_id, active: boolean }
//   reset_password  -> nova senha        { user_id, password }
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

// duração de "ban" usada para desativar (≈100 anos)
const BAN = '876000h'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json(405, { error: 'Metodo nao permitido' })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''

    // Identifica o chamador e revalida que é GERENTE
    const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
    const { data: userData, error: userErr } = await caller.auth.getUser()
    if (userErr || !userData?.user) return json(401, { error: 'Nao autenticado.' })
    const callerId = userData.user.id

    const { data: prof } = await caller.from('profiles').select('role').eq('user_id', callerId).single()
    if (prof?.role !== 'gerente') return json(403, { error: 'Apenas o gerente pode gerenciar usuarios.' })

    const body = await req.json().catch(() => ({}))
    const action = body.action ?? 'create'
    const admin = createClient(url, service)

    if (action === 'create') {
      const { email, password, nome } = body
      if (!email || !password) return json(400, { error: 'Informe e-mail e senha.' })
      if (String(password).length < 6) return json(400, { error: 'A senha precisa ter ao menos 6 caracteres.' })
      const { data: created, error: createErr } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
      if (createErr || !created?.user) {
        const msg = (createErr?.message || '').toLowerCase()
        if (msg.includes('already') || msg.includes('exist')) return json(409, { error: 'Ja existe um usuario com esse e-mail.' })
        return json(400, { error: createErr?.message || 'Falha ao criar usuario.' })
      }
      await admin.from('profiles').update({ nome: nome ?? '', created_by: callerId }).eq('user_id', created.user.id)
      return json(200, { ok: true, user_id: created.user.id })
    }

    if (action === 'set_role') {
      const { user_id, role } = body
      if (!user_id || !['supervisor', 'gerente'].includes(role)) return json(400, { error: 'Dados invalidos.' })
      if (user_id === callerId) return json(400, { error: 'Voce nao pode alterar o proprio papel.' })
      const { error } = await admin.from('profiles').update({ role }).eq('user_id', user_id)
      if (error) return json(400, { error: error.message })
      return json(200, { ok: true })
    }

    if (action === 'set_active') {
      const { user_id, active } = body
      if (!user_id || typeof active !== 'boolean') return json(400, { error: 'Dados invalidos.' })
      if (user_id === callerId) return json(400, { error: 'Voce nao pode desativar a propria conta.' })
      const { error: banErr } = await admin.auth.admin.updateUserById(user_id, { ban_duration: active ? 'none' : BAN })
      if (banErr) return json(400, { error: banErr.message })
      await admin.from('profiles').update({ ativo: active }).eq('user_id', user_id)
      return json(200, { ok: true })
    }

    if (action === 'reset_password') {
      const { user_id, password } = body
      if (!user_id || !password) return json(400, { error: 'Informe a nova senha.' })
      if (String(password).length < 6) return json(400, { error: 'A senha precisa ter ao menos 6 caracteres.' })
      const { error } = await admin.auth.admin.updateUserById(user_id, { password })
      if (error) return json(400, { error: error.message })
      return json(200, { ok: true })
    }

    return json(400, { error: 'Acao desconhecida.' })
  } catch (e) {
    return json(500, { error: String(e) })
  }
})
