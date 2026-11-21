// Service worker de Convertia. Lo genera nuxt.config.ts en cada build: el nombre de la caché
// pasa a ser uno que cambia con cada deploy, y la lista vacía, la lista real de /_nuxt/.
//
// Reglas (ver skill adaptar-a-pwa):
// - cache-first SOLO para /_nuxt/, que lleva hash en el nombre.
// - Todo lo demás (HTML, íconos, manifest, cotizaciones) va network-first: si no, queda congelado.
// - Sin conexión, cualquier página que no esté guardada se resuelve con /200.html: la app
//   calcula todo en el navegador, así que renderiza cualquier conversión.

const CACHE = 'convertia-dev'
const PRECACHE = [/* PRECACHE */]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) {
    const cache = await caches.open(CACHE)
    cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request)
    if (response.ok && response.type === 'basic') {
      const cache = await caches.open(CACHE)
      cache.put(request, response.clone())
    }
    return response
  }
  catch (error) {
    // Para los datos, ignorar el ?t= (marca de tiempo): sirve la última versión guardada.
    const cached = await caches.match(request, { ignoreSearch: true })
    if (cached) {
      if (request.mode === 'navigate') return cached
      // Avisarle a la app que esto es lo guardado y no lo último (la red falló).
      const headers = new Headers(cached.headers)
      headers.set('X-Convertia-Offline', '1')
      return new Response(cached.body, { status: cached.status, statusText: cached.statusText, headers })
    }
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl)
      if (fallback) return fallback
    }
    if (request.mode === 'navigate') {
      return new Response('<h1>Sin conexión</h1>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    }
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (url.pathname.startsWith('/_nuxt/')) {
    event.respondWith(cacheFirst(request))
    return
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, '/200.html'))
    return
  }
  event.respondWith(networkFirst(request))
})
