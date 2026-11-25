#!/usr/bin/env node
// Prueba de punta a punta de las cuentas, contra el Supabase LOCAL y su buzón de prueba (Mailpit).
//
//   npm run db:start && npm run build && node apps/web/scripts/e2e-cuentas.mjs
//
// (El build tiene que haberse hecho con apps/web/.env, que apunta al Supabase local.)
// Simula dos dispositivos (dos perfiles de navegador) con la misma cuenta.

import { execSync, spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import puppeteer from 'puppeteer-core'

const PORT = 4199
const BASE = `http://127.0.0.1:${PORT}`
const status = JSON.parse(execSync('npx supabase status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
const MAILPIT = status.MAILPIT_URL ?? status.INBUCKET_URL
const admin = createClient(status.API_URL, status.SECRET_KEY ?? status.SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const built = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', '.output', 'public', 'index.html'), 'utf8')
if (!built.includes(status.API_URL)) {
  console.error(`El build no apunta al Supabase local (${status.API_URL}). Corré «npm run build» con apps/web/.env.`)
  process.exit(1)
}

const chrome = [process.env.CHROME, 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', '/usr/bin/google-chrome'].find(p => p && existsSync(p))
const results = []
const check = (name, ok, detail = '') => {
  results.push(ok)
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}
const sleep = ms => new Promise(r => setTimeout(r, ms))

async function waitFor(fn, { timeout = 10000, every = 250 } = {}) {
  const end = Date.now() + timeout
  while (Date.now() < end) {
    const v = await fn()
    if (v) return v
    await sleep(every)
  }
  return undefined
}

/** Último mail de acceso que llegó a `email`: el código de 6 dígitos y el link. */
async function lastMail(email, after) {
  return waitFor(async () => {
    const res = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
    const { messages = [] } = await res.json()
    const msg = messages.find(m => Date.parse(m.Created) >= after)
    if (!msg) return undefined
    const full = await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json()
    const code = full.HTML.match(/letter-spacing:6px[^>]*>(\d{6})</)?.[1]
    const link = full.HTML.match(/href="([^"]+)"[^>]*>Entrar a Convertia/)?.[1]?.replace(/&amp;/g, '&')
    return code && link ? { code, link } : undefined
  }, { timeout: 15000 })
}

const server = spawn(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'serve-static.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] })
await new Promise(r => server.stdout.once('data', r))

const email = `e2e-${Date.now()}@ejemplo.test`
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const deviceA = await browser.createBrowserContext()
const deviceB = await browser.createBrowserContext()
const a = await deviceA.newPage()
const b = await deviceB.newPage()
const errors = []
for (const p of [a, b]) {
  // Que el tema por defecto no dependa del sistema donde corre la prueba.
  await p.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }])
  p.on('pageerror', e => errors.push(`${String(e)} (en ${p.url()})`))
  p.on('console', async (m) => {
    if (!['error', 'warn', 'warning'].includes(m.type()) || !/hydrat/i.test(m.text())) return
    // Con DEBUG_HYDRATION=1 Vue pasa los nodos como argumentos: se muestran para saber dónde está.
    const parts = await Promise.all(m.args().map(h => h.evaluate(x => x instanceof Node ? (x.outerHTML ?? x.textContent ?? '').slice(0, 160) : String(x).slice(0, 160)).catch(() => '')))
    errors.push(`${parts.join(' ').replace(/\s+/g, ' ')} (en ${p.url()})`)
  })
}
const text = (p, sel) => p.$eval(sel, el => el.textContent.trim()).catch(() => '')
const body = p => p.evaluate(() => document.body.innerText)
const userId = async () => (await admin.from('profiles').select('user_id, terms_version').order('created_at', { ascending: false }).limit(1)).data?.[0]

try {
  // --- Aviso de datos en el navegador ---
  await a.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  const notice = await a.$('[aria-label="Aviso sobre datos en tu navegador"]')
  check('el aviso aparece en la primera visita', !!notice)
  await a.click('[aria-label="Aviso sobre datos en tu navegador"] button')
  await a.reload({ waitUntil: 'networkidle0' })
  check('«Entendido» lo cierra y no vuelve al recargar', !(await a.$('[aria-label="Aviso sobre datos en tu navegador"]')))

  // --- El tema elegido sobrevive a recargar (bug de la F1) ---
  await a.click('button[aria-label="Usar tema oscuro"]')
  await a.reload({ waitUntil: 'networkidle0' })
  check('el modo oscuro elegido se mantiene al recargar', await a.evaluate(() => document.documentElement.classList.contains('dark')))
  await a.click('button[aria-label="Usar tema claro"]')

  // --- Un favorito ANTES de tener cuenta: tiene que subir al entrar ---
  await a.goto(`${BASE}/longitud/pies-a-metros`, { waitUntil: 'networkidle0' })
  await a.click('button[aria-pressed="false"]')
  check('favorito local antes de crear la cuenta', (await text(a, 'button[aria-pressed]')).includes('En favoritos'))

  // --- Dispositivo A: alta con el código del mail ---
  await a.goto(`${BASE}/cuenta`, { waitUntil: 'networkidle0' })
  const sendBtn = 'form button[type="submit"]'
  await a.type('input[type="email"]', email)
  check('sin la casilla, no se puede pedir el link', await a.$eval(sendBtn, el => el.disabled))
  await a.click('input[type="checkbox"]')
  const t0 = Date.now() - 1000
  await a.click(sendBtn)
  const mail1 = await lastMail(email, t0)
  check('llega el mail con link y código', !!mail1, mail1 ? `código ${mail1.code}` : '')
  await a.type('input[autocomplete="one-time-code"]', mail1.code)
  await a.click(sendBtn)
  await waitFor(async () => new URL(a.url()).pathname === '/' && (await body(a)).includes('Entraste a tu cuenta'))
  check('entra con el código y va al inicio con el aviso', new URL(a.url()).pathname === '/' && (await body(a)).includes('Entraste a tu cuenta'), a.url())
  await a.goto(`${BASE}/cuenta`, { waitUntil: 'networkidle0' })
  await waitFor(async () => (await body(a)).includes('Entraste como'))
  check('la cuenta queda activa', (await body(a)).includes(email))
  const prof = await userId()
  check('la aceptación de la casilla quedó registrada', prof?.terms_version === '2026-11-22', JSON.stringify(prof))
  const uid = prof.user_id

  const remoteKeys = async () => ((await admin.from('user_items').select('key, deleted').eq('user_id', uid)).data ?? [])
  const up = await waitFor(async () => (await remoteKeys()).some(i => i.key === 'unit:length:ft:m' && !i.deleted))
  check('el favorito local subió a la cuenta', !!up)

  // --- Dispositivo B: entra con el LINK (PKCE en el mismo navegador que lo pidió) ---
  await b.goto(`${BASE}/cuenta`, { waitUntil: 'networkidle0' })
  await b.click('input[type="checkbox"]')
  await b.type('input[type="email"]', email)
  const t1 = Date.now() - 1000
  await b.click(sendBtn)
  const mail2 = await lastMail(email, t1)
  await b.goto(mail2.link, { waitUntil: 'networkidle0' })
  await waitFor(async () => (await body(b)).includes('Entraste a tu cuenta'), { timeout: 20000 })
  const bOk = new URL(b.url()).pathname === '/' && (await body(b)).includes(email)
  check('el link del mail inicia la sesión en el otro dispositivo y va al inicio', bOk, bOk ? '' : `URL: ${b.url()} · página: ${(await body(b)).replace(/\s+/g, ' ').slice(0, 200)} · link: ${mail2.link.slice(0, 120)} · código del mail: ${mail2.code} (el de A era ${mail1.code})`)
  const favB = await waitFor(async () => (await body(b)).includes('Pies → Metros'))
  check('el favorito aparece en el otro dispositivo', !!favB)

  // --- B cambia el tema y borra el favorito; A lo recibe ---
  await b.click('button[aria-label="Usar tema oscuro"]')
  await b.goto(`${BASE}/longitud/pies-a-metros`, { waitUntil: 'networkidle0' })
  await b.click('button[aria-pressed="true"]')
  const gone = await waitFor(async () => (await remoteKeys()).some(i => i.key === 'unit:length:ft:m' && i.deleted))
  check('el borrado se sincroniza como lápida', !!gone)
  await sleep(2000)
  await a.goto(`${BASE}/cuenta`, { waitUntil: 'networkidle0' })
  await waitFor(async () => (await body(a)).includes('Sincronizado'))
  const sync = (await a.$$('button')).find(async x => (await x.evaluate(e => e.textContent)).includes('Sincronizar ahora'))
  await a.evaluate(() => [...document.querySelectorAll('button')].find(x => x.textContent.includes('Sincronizar ahora'))?.click())
  await waitFor(async () => a.evaluate(() => document.documentElement.classList.contains('dark')))
  check('el tema elegido en B llega a A', await a.evaluate(() => document.documentElement.classList.contains('dark')), sync ? '' : 'sin botón')
  check('el favorito borrado en B no resucita en A', await waitFor(async () => (await body(a)).includes('0 favoritos')) !== undefined, (await body(a)).match(/\d+ favoritos?/)?.[0])

  // --- Términos actualizados: se pide aceptar de nuevo ---
  await admin.from('profiles').update({ terms_version: '2020-01-01' }).eq('user_id', uid)
  await a.reload({ waitUntil: 'networkidle0' })
  await waitFor(async () => (await body(a)).includes('Actualizamos los términos'))
  check('con términos viejos pide aceptarlos de nuevo', (await body(a)).includes('Actualizamos los términos'))
  check('y ofrece descargar, eliminar o salir sin aceptar', ['Descargar mis datos', 'Eliminar cuenta', 'Salir'].every(async () => true) && /Descargar mis datos[\s\S]*Eliminar cuenta[\s\S]*Salir/.test(await body(a)))
  await a.click('section input[type="checkbox"]')
  await a.evaluate(() => [...document.querySelectorAll('button')].find(x => x.textContent.includes('Aceptar y continuar'))?.click())
  await waitFor(async () => (await body(a)).includes('Entraste como'))
  check('al aceptar vuelve a la cuenta', (await body(a)).includes('Entraste como') && (await userId()).terms_version === '2026-11-22')

  // --- Descargar mis datos ---
  // En contextos aislados Chrome no respeta la carpeta de descargas de CDP: se captura el archivo
  // en la página (el <a download> que arma la app) y se lee el blob.
  await a.evaluate(() => {
    window.__download = null
    URL.revokeObjectURL = () => {}
    HTMLAnchorElement.prototype.click = function () {
      if (this.download) window.__download = { name: this.download, href: this.href }
    }
  })
  await a.evaluate(() => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Descargar mis datos')?.click())
  const dl = await waitFor(() => a.evaluate(() => window.__download))
  const data = dl ? JSON.parse(await a.evaluate(href => fetch(href).then(r => r.text()), dl.href)) : {}
  check('«Descargar mis datos» baja un JSON con la cuenta', data.account?.email === email && Array.isArray(data.favorites), dl?.name)

  // --- Eliminar cuenta ---
  await a.evaluate(() => [...document.querySelectorAll('button')].find(x => x.textContent.trim() === 'Eliminar cuenta')?.click())
  await a.waitForSelector('[role="alertdialog"]')
  await a.evaluate(() => [...document.querySelectorAll('[role="alertdialog"] button')].find(x => x.textContent.includes('Eliminar definitivamente'))?.click())
  await waitFor(async () => (await body(a)).includes('Acepto los'))
  const { error: gone2 } = await admin.auth.admin.getUserById(uid)
  const rows = (await admin.from('user_items').select('key').eq('user_id', uid)).data ?? []
  check('eliminar cuenta la borra en el momento, con sus datos', !!gone2 && rows.length === 0)

  check('sin errores de consola ni de hidratación', errors.length === 0, errors.slice(0, 3).join(' | '))
}
catch (error) {
  check('el script terminó sin excepciones', false, String(error))
}
finally {
  await browser.close()
  server.kill()
  const { data } = await admin.auth.admin.listUsers()
  for (const u of data?.users ?? []) if (u.email === email) await admin.auth.admin.deleteUser(u.id).catch(() => {})
}

const failed = results.filter(ok => !ok).length
console.log(`\n${results.length - failed}/${results.length} OK`)
process.exit(failed ? 1 : 0)
