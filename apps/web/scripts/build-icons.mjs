#!/usr/bin/env node
// Genera los íconos PNG y el favicon.ico a partir de icons-src/*.svg, con Chrome headless.
//
//   node apps/web/scripts/build-icons.mjs
//
// Al cambiar un ícono hay que subir ICON_VERSION en app/utils/pwa.ts (el ?v= del manifest y del HTML)
// y se renueva solo el nombre de la caché del service worker (ver nuxt.config.ts).

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer-core'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public', 'icons')

const chrome = [
  process.env.CHROME,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find(p => p && existsSync(p))
if (!chrome) throw new Error('No encontré Chrome: definí CHROME=<ruta>')

const targets = [
  { src: 'icon.svg', file: 'icon-192.png', size: 192 },
  { src: 'icon.svg', file: 'icon-512.png', size: 512 },
  { src: 'icon-maskable.svg', file: 'icon-maskable-512.png', size: 512 },
  // iOS recorta sus propias esquinas: va a sangre, como el maskable.
  { src: 'icon-maskable.svg', file: 'apple-touch-icon.png', size: 180 },
  { src: 'icon.svg', file: 'favicon-32.png', size: 32 },
]

await mkdir(out, { recursive: true })
const browser = await puppeteer.launch({ executablePath: chrome, headless: true })
try {
  const page = await browser.newPage()
  for (const t of targets) {
    const svg = await readFile(join(root, 'icons-src', t.src), 'utf8')
    await page.setViewport({ width: t.size, height: t.size, deviceScaleFactor: 1 })
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${t.size}" height="${t.size}" `)}</body></html>`)
    await page.screenshot({ path: join(out, t.file), omitBackground: true, clip: { x: 0, y: 0, width: t.size, height: t.size } })
    console.log(`✓ ${t.file}`)
  }
}
finally {
  await browser.close()
}

// favicon.ico con un PNG de 32×32 adentro (formato válido desde Windows Vista y en todos los navegadores).
const png = await readFile(join(out, 'favicon-32.png'))
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0) // reservado
header.writeUInt16LE(1, 2) // tipo: ícono
header.writeUInt16LE(1, 4) // cantidad de imágenes
header.writeUInt8(32, 6) // ancho
header.writeUInt8(32, 7) // alto
header.writeUInt8(0, 8) // paleta
header.writeUInt8(0, 9) // reservado
header.writeUInt16LE(1, 10) // planos
header.writeUInt16LE(32, 12) // bits por pixel
header.writeUInt32LE(png.length, 14) // tamaño de la imagen
header.writeUInt32LE(22, 18) // offset de la imagen
await writeFile(join(root, 'public', 'favicon.ico'), Buffer.concat([header, png]))
await writeFile(join(root, 'public', 'favicon.svg'), await readFile(join(root, 'icons-src', 'icon.svg')))
console.log('✓ favicon.ico, favicon.svg')
