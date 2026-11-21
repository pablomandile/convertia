import type { Rates } from '@convertia/core'

export interface DolarAr {
  nombre: string
  compra: number | null
  venta: number | null
  actualizado: string
}

export interface RatesFile {
  updatedAt: string
  base: 'USD'
  rates: Rates
  ar: { dolares: Record<string, DolarAr> }
  sources: Record<string, { provider: string, url: string, updatedAt: string }>
  attribution: string
}

const STORAGE_KEY = 'convertia:rates'
const REFRESH_MS = 10 * 60 * 1000

/**
 * Cotizaciones de /api/v1/rates.json (las escribe el cron PHP).
 * Primero muestra lo último guardado en el dispositivo, así funciona sin conexión;
 * después intenta traer las frescas.
 */
export function useRates() {
  const data = useState<RatesFile | null>('rates:data', () => null)
  const status = useState<'idle' | 'loading' | 'ready' | 'offline' | 'error'>('rates:status', () => 'idle')
  const fetchedAt = useState('rates:fetchedAt', () => 0)
  const config = useRuntimeConfig()

  async function load(force = false) {
    if (import.meta.server || status.value === 'loading') return
    if (!force && Date.now() - fetchedAt.value < REFRESH_MS) return

    if (!data.value) {
      const cached = readStorage<RatesFile | null>(STORAGE_KEY, null)
      if (cached?.rates?.USD) {
        data.value = cached
        status.value = 'ready'
      }
    }

    const previous = status.value
    status.value = 'loading'
    try {
      const response = await $fetch.raw<RatesFile>(config.public.ratesUrl, { query: { t: Math.floor(Date.now() / REFRESH_MS) } })
      const fresh = response._data
      if (!fresh?.rates?.USD) throw new Error('rates.json inválido')
      data.value = fresh
      writeStorage(STORAGE_KEY, fresh)
      // El service worker marca así lo que devolvió de su caché porque falló la red.
      const fromCache = response.headers.get('X-Convertia-Offline') === '1'
      if (!fromCache) fetchedAt.value = Date.now()
      status.value = fromCache ? 'offline' : 'ready'
    }
    catch {
      status.value = data.value || previous === 'ready' ? 'offline' : 'error'
    }
  }

  // Sin conexión el service worker puede devolver el rates.json guardado como si fuera nuevo:
  // por eso el aviso «sin conexión» mira también navigator.onLine, no solo si falló la descarga.
  const online = useState('rates:online', () => true)
  const setOnline = () => {
    online.value = navigator.onLine
    if (online.value) load(true)
  }

  onMounted(() => {
    online.value = navigator.onLine
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOnline)
    load()
  })
  onUnmounted(() => {
    window.removeEventListener('online', setOnline)
    window.removeEventListener('offline', setOnline)
  })

  const isOffline = computed(() => status.value === 'offline' || (!online.value && !!data.value))
  const rates = computed<Rates | undefined>(() => data.value?.rates)
  const updatedAt = computed(() => {
    const iso = data.value?.sources?.fiat?.updatedAt ?? data.value?.updatedAt
    return iso ? new Date(iso) : undefined
  })

  return { data, rates, status, isOffline, updatedAt, load }
}
