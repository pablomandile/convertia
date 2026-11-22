#!/usr/bin/env node
// Mantiene verdaderos los textos legales:
//  1. Toda clave que la app guarda en el navegador figura en content/legal/cookies.md.
//  2. Lo que promete la política de privacidad coincide con el código (plazos, límites, botones).
//
//   node apps/web/scripts/check-legal.mjs      (corre con npm test)

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const web = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = p => readFileSync(join(web, p), 'utf8')
const cookies = read('content/legal/cookies.md')
const privacy = read('content/legal/privacidad.md')
const terms = read('content/legal/terminos.md')

let failures = 0
const check = (ok, message) => {
  if (!ok) {
    failures++
    console.log(`✗ ${message}`)
  }
}

// --- 1. Inventario del navegador -----------------------------------------------------
function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : /\.(ts|vue|js)$/.test(name) ? [p] : []
  })
}

const found = new Map() // clave → archivo
for (const file of [...walk(join(web, 'app')), join(web, 'sw', 'sw.template.js'), join(web, 'nuxt.config.ts')]) {
  const src = readFileSync(file, 'utf8')
  // Literales 'convertia:…' (y template literals cortados en el primer ${).
  for (const m of src.matchAll(/['"`](convertia:[a-z0-9:-]*)/g)) {
    const key = m[1].replace(/[:-]$/, '')
    if (key !== 'convertia') found.set(key, relative(web, file))
  }
  // Nombre de la caché del service worker (sin la versión).
  if (/caches\.open|const CACHE/.test(src) && /'convertia-dev'/.test(src)) found.set('convertia-', relative(web, file))
}
// Claves que se arman con una variable: `convertia:${name}` en useSaved, y la que agrega supabase-js al storageKey.
found.set('convertia:favorites', 'app/composables/useSaved.ts')
found.set('convertia:recent', 'app/composables/useSaved.ts')
found.set('convertia:auth-code-verifier', 'supabase-js (storageKey + "-code-verifier")')

for (const [key, file] of found) {
  check(cookies.includes(key), `La clave «${key}» se guarda en ${file} y no figura en content/legal/cookies.md`)
}
// Ancla: si los regex dejaran de encontrar claves, el chequeo pasaría sin probar nada.
for (const known of ['convertia:theme', 'convertia:rates', 'convertia:ipc', 'convertia:auth', 'convertia:aviso-cookies', 'convertia:terms-pending', 'convertia:cities']) {
  check(found.has(known), `El inventario no encontró «${known}» en el código: ¿cambió cómo se guarda?`)
}
check(!/document\.cookie\s*=/.test(walk(join(web, 'app')).map(f => readFileSync(f, 'utf8')).join('\n')), 'La app escribe cookies: el texto dice que no usa cookies propias')

// --- 2. Promesas de la política ---------------------------------------------------------
const tombstone = Number(readFileSync(join(web, '..', '..', 'packages/core/src/sync.ts'), 'utf8').match(/TOMBSTONE_DAYS = (\d+)/)?.[1])
check(tombstone > 0 && privacy.includes(`**${tombstone} días**`), `La privacidad tiene que decir «${tombstone} días» (TOMBSTONE_DAYS en core/sync.ts)`)

const recentMax = Number(read('app/composables/useSaved.ts').match(/recent: (\d+)/)?.[1])
check(privacy.includes(`últimas ${recentMax}`) && cookies.includes(`últimas ${recentMax}`), `Los textos tienen que decir «últimas ${recentMax}» (SAVED_LIMITS.recent)`)

const cuenta = read('app/pages/cuenta.vue')
for (const label of ['Descargar mis datos', 'Eliminar cuenta']) {
  check(privacy.includes(label) && cuenta.includes(label), `«${label}» tiene que estar en la privacidad y como botón en /cuenta`)
}

const legal = read('app/utils/legal.ts')
const contact = legal.match(/LEGAL_CONTACT = '([^']+)'/)?.[1]
check(!!contact && privacy.includes(contact) && terms.includes(contact), `El contacto (${contact}) tiene que figurar en los dos textos`)
check(/LEGAL_VERSION = '\d{4}-\d{2}-\d{2}'/.test(legal), 'LEGAL_VERSION tiene que ser una fecha AAAA-MM-DD')
check(privacy.includes('13 años') && terms.includes('13 años'), 'La edad mínima tiene que coincidir en los dos textos')

const migration = readdirSync(join(web, '..', '..', 'supabase', 'migrations')).map(f => readFileSync(join(web, '..', '..', 'supabase', 'migrations', f), 'utf8')).join('\n')
check(/on delete cascade/.test(migration) && /delete from auth\.users where id = auth\.uid\(\)/.test(migration), 'La privacidad promete borrado inmediato: la migración tiene que borrar en cascada')
check(privacy.includes('São Paulo'), 'La región de Supabase (São Paulo) tiene que figurar en la privacidad')

if (failures) {
  console.log(`\n${failures} problema(s) en los textos legales`)
  process.exit(1)
}
console.log(`✓ Textos legales: ${found.size} claves del navegador declaradas y las promesas coinciden con el código`)
