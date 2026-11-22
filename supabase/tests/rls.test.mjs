#!/usr/bin/env node
// Pruebas de seguridad de la base contra el Supabase LOCAL (npx supabase start):
// dos usuarios reales, cada uno con su sesión, intentando leer y tocar lo del otro.
//
//   npm run test:db
//
// Crea usuarios descartables con la clave de servicio local y los borra al terminar.

import { execSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const status = JSON.parse(execSync('npx supabase status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
const URL = status.API_URL
const ANON = status.PUBLISHABLE_KEY ?? status.ANON_KEY
const SERVICE = status.SECRET_KEY ?? status.SERVICE_ROLE_KEY
if (!URL?.includes('127.0.0.1') && !URL?.includes('localhost')) {
  console.error(`Esto corre solo contra Supabase local, y la URL es ${URL}`)
  process.exit(1)
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } })
const results = []
const check = (name, ok, detail = '') => {
  results.push(ok)
  console.log(`${ok ? '✓' : '✗'} ${name}${detail && !ok ? ` — ${detail}` : ''}`)
}

async function newUser(tag) {
  const email = `rls-${tag}-${Date.now()}@ejemplo.test`
  const password = `clave-${Math.random().toString(36).slice(2)}-X1`
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true })
  if (error) throw error
  const client = createClient(URL, ANON, { auth: { persistSession: false } })
  const { error: e } = await client.auth.signInWithPassword({ email, password })
  if (e) throw e
  return { id: data.user.id, client }
}

const item = (key, extra = {}) => ({ list: 'favorites', key, label: key, href: `/longitud/${key}`, updated_at: new Date().toISOString(), ...extra })

const created = []
try {
  const a = await newUser('a')
  const b = await newUser('b')
  created.push(a.id, b.id)

  // Perfil creado por el trigger, sin términos.
  const { data: pa } = await a.client.from('profiles').select('*').eq('user_id', a.id).single()
  check('el trigger crea el perfil sin términos aceptados', pa?.terms_version === null)

  // Aceptar términos solo por RPC; escribir directo no se puede.
  const direct = await a.client.from('profiles').update({ terms_version: 'trucho' }).eq('user_id', a.id).select()
  check('no se puede escribir la constancia de términos directamente', (direct.data ?? []).length === 0)
  const { error: accErr } = await a.client.rpc('accept_terms', { version: '2026-11-22' })
  const { data: pa2 } = await a.client.from('profiles').select('*').eq('user_id', a.id).single()
  check('accept_terms registra versión y fecha del servidor', !accErr && pa2.terms_version === '2026-11-22' && !!pa2.terms_accepted_at, accErr?.message)

  // A guarda; B no lo ve ni lo puede tocar.
  const ins = await a.client.from('user_items').insert(item('pies-a-metros'))
  check('A guarda un favorito', !ins.error, ins.error?.message)
  const bSees = await b.client.from('user_items').select('*')
  check('B no ve los favoritos de A', (bSees.data ?? []).length === 0)
  const bUpd = await b.client.from('user_items').update({ label: 'hackeado' }).eq('key', 'pies-a-metros').select()
  check('B no puede modificar los de A', (bUpd.data ?? []).length === 0)
  const bDel = await b.client.from('user_items').delete().eq('key', 'pies-a-metros').select()
  check('B no puede borrar los de A', (bDel.data ?? []).length === 0)
  const bFake = await b.client.from('user_items').insert({ ...item('robado'), user_id: a.id })
  check('B no puede escribir a nombre de A', !!bFake.error)
  const aStill = await admin.from('user_items').select('label').eq('user_id', a.id)
  check('lo de A quedó intacto', aStill.data?.length === 1 && aStill.data[0].label === 'pies-a-metros')

  // Sin sesión no se ve nada.
  const anon = createClient(URL, ANON, { auth: { persistSession: false } })
  const anonSees = await anon.from('user_items').select('*')
  check('sin sesión no se ve nada', (anonSees.data ?? []).length === 0)
  const anonRpc = await anon.rpc('delete_my_account')
  check('sin sesión no se puede llamar a delete_my_account', !!anonRpc.error)

  // Validaciones de contenido.
  for (const href of ['//evil.example', 'https://evil.example', '\\\\evil', 'javascript:alert(1)']) {
    const r = await a.client.from('user_items').insert(item(`malo-${href.length}`, { href }))
    check(`rechaza href externo ${JSON.stringify(href)}`, !!r.error)
  }
  const big = await a.client.from('user_settings').insert({ data: { x: 'a'.repeat(5000) } })
  check('rechaza ajustes enormes', !!big.error)

  // Tope de 500 por persona.
  const many = Array.from({ length: 500 }, (_, i) => item(`k${i}`))
  const bulk = await b.client.from('user_items').insert(many)
  const over = await b.client.from('user_items').insert(item('k500'))
  check('tope de 500 elementos por persona', !bulk.error && !!over.error, bulk.error?.message)

  // Eliminar cuenta: borra usuario, perfil, ítems y ajustes en cascada.
  await a.client.from('user_settings').insert({ data: { theme: 'dark' } })
  const del = await a.client.rpc('delete_my_account')
  const [u, p, i, s] = await Promise.all([
    admin.auth.admin.getUserById(a.id),
    admin.from('profiles').select('user_id').eq('user_id', a.id),
    admin.from('user_items').select('key').eq('user_id', a.id),
    admin.from('user_settings').select('user_id').eq('user_id', a.id),
  ])
  check('eliminar cuenta borra todo en el momento', !del.error && !!u.error && !p.data.length && !i.data.length && !s.data.length, del.error?.message)
  if (!del.error) created.shift()
  const bAfter = await admin.from('user_items').select('key', { count: 'exact', head: true }).eq('user_id', b.id)
  check('y no toca lo de otras cuentas', bAfter.count === 500)
}
catch (error) {
  check('el script terminó sin excepciones', false, error?.message ?? String(error))
}
finally {
  for (const id of created) await admin.auth.admin.deleteUser(id).catch(() => {})
}

const failed = results.filter(ok => !ok).length
console.log(`\n${results.length - failed}/${results.length} OK`)
process.exit(failed ? 1 : 0)
