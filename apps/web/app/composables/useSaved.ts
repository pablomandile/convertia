import { toast } from 'vue-sonner'

export interface SavedConversion {
  /** Identifica la conversión sin el valor: "unit:length:ft:m", "currency:USD:ARS". */
  key: string
  label: string
  href: string
}

/**
 * Lista guardada en el dispositivo. Se carga después de montar, para que el HTML
 * prerenderizado y el primer render del navegador coincidan.
 * (En la F3 se sincroniza con la cuenta vía Supabase.)
 */
function useSavedList(name: string, max: number) {
  const storageKey = `convertia:${name}`
  const list = useState<SavedConversion[]>(`saved:${name}`, () => [])
  const loaded = useState(`saved:${name}:loaded`, () => false)

  onMounted(() => {
    if (loaded.value) return
    list.value = readStorage<SavedConversion[]>(storageKey, []).slice(0, max)
    loaded.value = true
  })

  function set(items: SavedConversion[]) {
    list.value = items.slice(0, max)
    writeStorage(storageKey, list.value)
  }

  return { list, set }
}

export function useFavorites() {
  const { list, set } = useSavedList('favorites', 50)

  const has = (key: string) => list.value.some(f => f.key === key)

  function toggle(item: SavedConversion) {
    if (has(item.key)) {
      set(list.value.filter(f => f.key !== item.key))
      toast('Quitado de favoritos')
    }
    else {
      set([item, ...list.value])
      toast.success('Agregado a favoritos')
    }
  }

  return { favorites: list, has, toggle }
}

export function useRecent() {
  const { list, set } = useSavedList('recent', 12)

  function push(item: SavedConversion) {
    set([item, ...list.value.filter(r => r.key !== item.key)])
  }

  function clear() {
    set([])
  }

  return { recent: list, push, clear }
}
