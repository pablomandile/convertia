import type { HistorySources, Series } from '@convertia/core'

interface SeriesFile {
  updatedAt: string
  series: Record<string, Series>
  source: { provider: string, url: string }
}

/**
 * Historia para los gráficos (/api/v1/series/*.json, la escribe el cron). Se pide recién cuando una
 * página la necesita. Sin conexión la sirve el service worker con lo último que bajó.
 */
export function useHistory() {
  const files = useState<Record<string, SeriesFile | null>>('history:files', () => ({}))
  const loading = useState<Record<string, boolean>>('history:loading', () => ({}))
  const config = useRuntimeConfig()

  async function load(name: 'dolares' | 'monedas' | 'cripto') {
    if (import.meta.server || files.value[name] !== undefined || loading.value[name]) return
    loading.value = { ...loading.value, [name]: true }
    try {
      const url = config.public.ratesUrl.replace(/rates\.json$/, `series/${name}.json`)
      const data = await $fetch<SeriesFile>(url, { query: { d: new Date().toISOString().slice(0, 10) } })
      files.value = { ...files.value, [name]: data?.series ? data : null }
    }
    catch {
      files.value = { ...files.value, [name]: null }
    }
    finally {
      loading.value = { ...loading.value, [name]: false }
    }
  }

  /** Las fuentes que hacen falta para un par de monedas, en el formato de core/series. */
  const sources = computed<HistorySources>(() => ({
    ...(files.value.dolares?.series.oficial ? { ars: files.value.dolares.series.oficial } : {}),
    ...(files.value.monedas ? { fiat: files.value.monedas.series } : {}),
    ...(files.value.cripto ? { usdPrice: files.value.cripto.series } : {}),
  }))

  return { files, loading, load, sources }
}

/** Selector de período: 1 mes … 2 años. */
export const RANGES = [
  { days: 30, label: '1 mes' },
  { days: 91, label: '3 meses' },
  { days: 182, label: '6 meses' },
  { days: 365, label: '1 año' },
  { days: 730, label: '2 años' },
] as const
