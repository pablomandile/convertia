#!/usr/bin/env node
// Sirve .output/public como lo hace el .htaccess de Hostinger, para probar el build en local:
//   archivo existente → ese archivo · carpeta → su index.html · lo demás → 200.html
//   /api/ → public/api (salida local del cron: php rates/fetch.php --out=apps/web/public/api/v1)
//
//   node apps/web/scripts/serve-static.mjs [puerto]

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, '.output', 'public')
const api = join(root, 'public')
const port = Number(process.argv[2] ?? 4173)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  }
  catch {
    return false
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  const base = path.startsWith(`${normalize('/api/')}`) ? api : dist
  const candidates = [join(base, path), join(base, path, 'index.html')]
  if (base === dist) candidates.push(join(dist, '200.html'))

  for (const file of candidates) {
    if (!file.startsWith(base) || !(await isFile(file))) continue
    const type = TYPES[extname(file)] ?? 'application/octet-stream'
    const noCache = /\.html$|sw\.js$|manifest\.webmanifest$|\.json$/.test(file)
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': noCache ? 'no-cache' : 'public, max-age=31536000, immutable' })
    res.end(await readFile(file))
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404')
}).listen(port, '127.0.0.1', () => console.log(`Convertia (build estático) en http://127.0.0.1:${port}`))
