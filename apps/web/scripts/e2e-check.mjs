#!/usr/bin/env node
// Verificación de punta a punta del build estático con Chrome headless.
//
//   npm run build && node apps/web/scripts/e2e-check.mjs [--shots=<carpeta>]
//
// Levanta su propio servidor (scripts/serve-static.mjs) y al final lo APAGA para probar el modo
// sin conexión de verdad: la emulación offline de Chrome no alcanza a los pedidos del service worker.
//
// Revisa: instalabilidad PWA (veredicto de Chrome por CDP), service worker activo, barra inteligente,
// páginas prerenderizadas y no prerenderizadas, desborde horizontal en 320/390 px, errores de consola
// (incluidos los de hidratación) y funcionamiento SIN CONEXIÓN.

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const PORT = 4199
// Páginas de herramientas que se revisan en el chequeo de desborde (sumar las nuevas).
const TOOL_PAGES = ['/numeros/romanos', '/numeros/bases', '/numeros/a-letras', '/dolar', '/inflacion', '/cuotas', '/plazo-fijo', '/iva']
const BASE = `http://127.0.0.1:${PORT}`
const SHOTS = process.argv.find(a => a.startsWith('--shots='))?.slice(8)
if (SHOTS) mkdirSync(SHOTS, { recursive: true })

const server = spawn(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), 'serve-static.mjs'), String(PORT)], { stdio: ['ignore', 'pipe', 'inherit'] })
await new Promise((resolve, reject) => {
  server.stdout.once('data', resolve)
  server.once('exit', code => reject(new Error(`El servidor estático terminó (código ${code})`)))
})
const stopServer = () => new Promise((resolve) => {
  // Si lo terminó una señal, exitCode queda en null y la que se llena es signalCode.
  if (server.exitCode !== null || server.signalCode !== null) return resolve()
  server.once('exit', resolve)
  server.kill()
})

const chrome = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && existsSync(p))

const results = []
const check = (name, ok, detail = '') => {
  results.push({ name, ok })
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`)
}

const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
const page = await browser.newPage()
const consoleErrors = []
page.on('console', (msg) => {
  if (['error', 'warning'].includes(msg.type()) && /hydrat|error/i.test(msg.text())) consoleErrors.push(msg.text())
})
page.on('pageerror', err => consoleErrors.push(String(err)))

const text = sel => page.$eval(sel, el => el.textContent.trim())
const shot = async (name) => {
  if (SHOTS) await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: true })
}

try {
  // 1. PWA
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle0' })
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload({ waitUntil: 'networkidle0' })
  const cdp = await page.createCDPSession()
  const manifest = await cdp.send('Page.getAppManifest')
  check('manifest sin errores', manifest.errors.length === 0, JSON.stringify(manifest.errors))
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors')
  check('Chrome la considera instalable', installabilityErrors.length === 0, JSON.stringify(installabilityErrors))
  const swState = await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state)
  check('service worker activo', swState === 'activated', swState)
  await shot('home-390')

  // 2. Barra inteligente (con cotizaciones)
  await page.type('#smartbar', '100 usd a ars')
  await page.waitForFunction(() => /USD = .* ARS/.test(document.querySelector('#smartbar-result')?.textContent ?? ''), { timeout: 5000 })
  check('barra inteligente: 100 usd a ars', true, await text('#smartbar-result'))
  await page.evaluate(() => (document.querySelector('#smartbar').value = ''))
  await page.click('#smartbar', { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type('#smartbar', '5 ft 10 in en cm')
  await page.waitForFunction(() => /177,8 cm/.test(document.querySelector('#smartbar-result')?.textContent ?? ''), { timeout: 5000 })
  check('barra inteligente: 5 ft 10 in en cm = 177,8', true)
  await page.keyboard.press('Enter')
  await page.waitForFunction(() => location.pathname === '/longitud/pies-a-centimetros', { timeout: 5000 })
  check('Enter navega al par', true, await page.evaluate(() => location.pathname + location.search))

  // 3. Página prerenderizada
  await page.goto(`${BASE}/longitud/pies-a-metros`, { waitUntil: 'networkidle0' })
  check('pies a metros = 0,3048', (await text('output')) === '0,3048', await text('output'))
  const prerendered = await (await fetch(`${BASE}/longitud/pies-a-metros`)).text()
  check('HTML prerenderizado trae el resultado (SEO)', prerendered.includes('0,3048') && prerendered.includes('<title>Pies a metros'))
  await shot('pies-a-metros-390')

  // 4. Cambiar el valor y la unidad actualiza la URL
  await page.focus('#conv-value')
  await page.keyboard.down('Control')
  await page.keyboard.press('KeyA')
  await page.keyboard.up('Control')
  await page.type('#conv-value', '10')
  await page.select('#conv-to', 'cm')
  await page.waitForFunction(() => location.pathname.endsWith('pies-a-centimetros') && location.search === '?v=10', { timeout: 5000 })
  check('URL compartible al cambiar valor y unidad', true, await page.evaluate(() => location.pathname + location.search))
  check('10 pies = 304,8 cm', (await text('output')) === '304,8')

  // 5. Par no prerenderizado (llega por 200.html)
  await page.goto(`${BASE}/masa/stones-a-gramos?v=2`, { waitUntil: 'networkidle0' })
  check('par no prerenderizado se resuelve en el navegador', (await text('output')) === '12.700,58636', await text('output'))

  // 6. Monedas
  await page.goto(`${BASE}/monedas/usd-a-ars`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => !/Cargando/.test(document.querySelector('output')?.textContent ?? 'Cargando'), { timeout: 8000 })
  check('USD a ARS muestra cotización', /^[\d.]+,\d{2}$/.test(await text('output')), await text('output'))
  check('muestra los dólares de Argentina', await page.$$eval('section h2', hs => hs.some(h => h.textContent.includes('Dólares en Argentina'))))
  await shot('usd-a-ars-390')

  // 6b. Herramientas (valores por defecto de cada página)
  const outputs = async () => page.$$eval('output', els => els.map(e => e.textContent.trim()))
  await page.goto(`${BASE}/numeros/romanos`, { waitUntil: 'networkidle0' })
  check('romanos: 2026 = MMXXVI', (await outputs()).includes('MMXXVI'))
  await page.goto(`${BASE}/numeros/bases`, { waitUntil: 'networkidle0' })
  check('bases: 255 = 1111 1111 = FF', (await outputs()).includes('1111 1111') && (await outputs()).includes('FF'))
  await page.goto(`${BASE}/numeros/a-letras`, { waitUntil: 'networkidle0' })
  check('a letras: 1234,50', (await outputs()).includes('Mil doscientos treinta y cuatro pesos con 50/100'), (await outputs()).join(' | '))
  await page.goto(`${BASE}/iva`, { waitUntil: 'networkidle0' })
  check('IVA: $ 1.000 + 21 % = $ 1.210,00', (await outputs()).some(o => o.replace(/\s/g, ' ') === '$ 1.210,00'), (await outputs()).join(' | '))
  await page.goto(`${BASE}/plazo-fijo`, { waitUntil: 'networkidle0' })
  check('plazo fijo: $ 1.000.000 al 30 % por 30 días = $ 24.657,53', (await outputs()).some(o => o.replace(/\s/g, ' ') === '$ 24.657,53'), (await outputs()).join(' | '))
  await page.goto(`${BASE}/dolar`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => document.querySelectorAll('[aria-pressed]').length >= 5, { timeout: 8000 }).catch(() => {})
  check('dólar: tarjetas de cada cotización', (await page.$$('[aria-pressed]')).length >= 5)
  check('dólar: conversor con el blue', (await outputs()).some(o => /^\$\s[\d.]+,\d{2}$/.test(o)), (await outputs()).join(' | '))
  await page.goto(`${BASE}/inflacion`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => /Inflación acumulada/.test(document.body.textContent), { timeout: 8000 }).catch(() => {})
  check('inflación: ajusta $ 10.000 de enero de 2019', /Inflación acumulada/.test(await page.evaluate(() => document.body.textContent)), (await outputs()).join(' | '))
  await page.goto(`${BASE}/cuotas`, { waitUntil: 'networkidle0' })
  await page.waitForFunction(() => /Conviene (en cuotas|de contado)|Da lo mismo/.test(document.body.textContent), { timeout: 8000 }).catch(() => {})
  // El veredicto depende de la inflación del mes: se chequea que haya uno y que use la sugerida del IPC.
  const cuotasText = await page.evaluate(() => document.body.textContent)
  check('cuotas: veredicto con la inflación del IPC', /Conviene (en cuotas|de contado)|Da lo mismo/.test(cuotasText) && /Sugerida: promedio/.test(cuotasText), cuotasText.match(/Conviene [a-z ]+|Da lo mismo/)?.[0])
  const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`)).text()
  check('sitemap.xml lista categorías y herramientas', sitemapXml.includes('/longitud/pies-a-metros</loc>') && sitemapXml.includes('/numeros/romanos</loc>'))

  // 7. Desborde horizontal
  const pages = ['/', '/longitud/pies-a-metros', '/consumo-de-combustible/millas-por-galon-ee-uu-a-litros-cada-100-km', '/monedas/usd-a-ars', '/densidad', ...TOOL_PAGES]
  for (const width of [320, 390]) {
    await page.setViewport({ width, height: 800, isMobile: true, hasTouch: true })
    for (const p of pages) {
      await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle0' })
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement
        if (doc.scrollWidth <= doc.clientWidth) return null
        const culprit = [...document.querySelectorAll('body *')].find(el => el.getBoundingClientRect().right > doc.clientWidth + 1)
        return `${doc.scrollWidth}px > ${doc.clientWidth}px, ej: <${culprit?.tagName.toLowerCase()} class="${culprit?.className}">`
      })
      check(`sin scroll horizontal a ${width}px en ${p}`, !overflow, overflow ?? '')
    }
  }
  await page.setViewport({ width: 320, height: 800, isMobile: true })
  await page.goto(`${BASE}/consumo-de-combustible/millas-por-galon-ee-uu-a-litros-cada-100-km`, { waitUntil: 'networkidle0' })
  await shot('combustible-320')

  check('sin errores de consola ni de hidratación', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '))

  // 8. Sin conexión DE VERDAD: se apaga el servidor (además de avisarle a la página que no hay red).
  await stopServer()
  await page.setOfflineMode(true)
  await page.goto(`${BASE}/velocidad/nudos-a-millas-por-hora?v=30`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('output')?.textContent.trim() === '34,52338344', { timeout: 8000 }).catch(() => {})
  check('sin conexión: página nunca visitada funciona', (await text('output')) === '34,52338344', await text('output'))
  await page.goto(`${BASE}/monedas/eur-a-brl`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => /Sin conexión/.test(document.body.textContent), { timeout: 8000 }).catch(() => {})
  const header = await page.evaluate(() => document.querySelector('h1')?.parentElement?.textContent.replace(/\s+/g, ' ').trim() ?? '')
  check('sin conexión: monedas con la última cotización guardada y aviso', /^[\d.]+,\d{2}$/.test(await text('output')) && /Sin conexión/.test(header), `${await text('output')} · ${header}`)
  await shot('offline-eur-a-brl')
}
catch (error) {
  check('el script terminó sin excepciones', false, `${error} (en ${page.url()})`)
  const value = await page.$eval('#conv-value', el => el.value).catch(() => undefined)
  if (value !== undefined) console.log(`  valor en el input: "${value}", resultado: "${await text('output').catch(() => '')}"`)
}
finally {
  await browser.close()
  await stopServer()
}

const failed = results.filter(r => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} OK`)
process.exit(failed ? 1 : 0)
