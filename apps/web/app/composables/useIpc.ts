import type { IndexSeries } from '@convertia/core'

export interface IpcFile {
  updatedAt: string
  base: string
  serie: IndexSeries
  source: { provider: string, url: string }
}

const STORAGE_KEY = 'convertia:ipc'

/** IPC mensual del INDEC (/api/v1/ipc.json, lo escribe el cron). Guardado en el dispositivo para usar sin conexión. */
export function useIpc() {
  const data = useState<IpcFile | null>('ipc:data', () => null)
  const status = useState<'idle' | 'loading' | 'ready' | 'error'>('ipc:status', () => 'idle')
  const config = useRuntimeConfig()

  async function load() {
    if (import.meta.server || status.value === 'loading' || status.value === 'ready') return
    if (!data.value) {
      const cached = readStorage<IpcFile | null>(STORAGE_KEY, null)
      if (cached?.serie?.length) data.value = cached
    }
    status.value = 'loading'
    try {
      const url = config.public.ratesUrl.replace(/rates\.json$/, 'ipc.json')
      const fresh = await $fetch<IpcFile>(url, { query: { t: new Date().toISOString().slice(0, 10) } })
      if (!fresh?.serie?.length) throw new Error('ipc.json inválido')
      data.value = fresh
      writeStorage(STORAGE_KEY, fresh)
      status.value = 'ready'
    }
    catch {
      status.value = data.value ? 'ready' : 'error'
    }
  }

  onMounted(load)

  const series = computed<IndexSeries>(() => data.value?.serie ?? [])
  const lastMonth = computed(() => series.value.at(-1)?.[0])

  return { data, series, lastMonth, status, load }
}

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** "2026-10" → "octubre de 2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-')
  return `${MONTHS[Number(m) - 1]} de ${y}`
}
