export interface Feriado { fecha: string, nombre: string, tipo: string }

interface FeriadosFile {
  updatedAt: string
  years: number[]
  feriados: Feriado[]
}

/** Feriados nacionales de Argentina (/api/v1/feriados.json, del cron). Sin conexión, los sirve el service worker. */
export function useFeriados() {
  const data = useState<FeriadosFile | null | undefined>('feriados', () => undefined)
  const config = useRuntimeConfig()

  async function load() {
    if (import.meta.server || data.value !== undefined) return
    try {
      const url = config.public.ratesUrl.replace(/rates\.json$/, 'feriados.json')
      const res = await $fetch<FeriadosFile>(url, { query: { d: new Date().toISOString().slice(0, 10) } })
      data.value = res?.feriados?.length ? res : null
    }
    catch {
      data.value = null
    }
  }

  onMounted(load)

  const dates = computed(() => new Set((data.value?.feriados ?? []).map(f => f.fecha)))
  const years = computed(() => data.value?.years ?? [])

  return { data, dates, years }
}
