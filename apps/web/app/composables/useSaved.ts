import { compactItems, mergeItems, upgradeLegacyItems, visibleItems, type SyncItem } from '@convertia/core'
import { toast } from 'vue-sonner'

export interface SavedConversion {
  /** Identifica la conversión sin el valor: "unit:length:ft:m", "currency:USD:ARS". */
  key: string
  label: string
  href: string
}

export type SavedListName = 'favorites' | 'recent'
export const SAVED_LIMITS: Record<SavedListName, number> = { favorites: 50, recent: 12 }

/**
 * Lista guardada en el dispositivo, con fecha por ítem y lápidas para los borrados
 * (ver core/sync.ts). Si hay sesión, useSync la combina con la cuenta.
 */
export function useSavedStore(name: SavedListName) {
  const storageKey = `convertia:${name}`
  const max = SAVED_LIMITS[name]
  const items = useState<SyncItem[]>(`saved:${name}`, () => [])
  const loaded = useState(`saved:${name}:loaded`, () => false)

  /** Se llama recién en el navegador, para que el HTML prerenderizado y el primer render coincidan. */
  function ensureLoaded() {
    if (loaded.value || import.meta.server) return
    items.value = compactItems(upgradeLegacyItems(readStorage<unknown>(storageKey, [])), max)
    loaded.value = true
  }

  function set(next: SyncItem[], { sync = true } = {}) {
    items.value = compactItems(next, max)
    writeStorage(storageKey, items.value)
    if (sync) useSync().requestSync()
  }

  const visible = computed(() => visibleItems(items.value, max))

  return { items, visible, ensureLoaded, set, max }
}

function useSavedList(name: SavedListName) {
  const store = useSavedStore(name)
  onMounted(store.ensureLoaded)
  const now = () => new Date().toISOString()

  function upsert(item: SavedConversion) {
    store.set(mergeItems([{ ...item, updatedAt: now() }], store.items.value))
  }

  function remove(key: string) {
    store.set(store.items.value.map(i => i.key === key ? { ...i, deleted: true, updatedAt: now() } : i))
  }

  function clearAll() {
    const t = now()
    store.set(store.items.value.map(i => i.deleted ? i : { ...i, deleted: true, updatedAt: t }))
  }

  return { list: store.visible, upsert, remove, clearAll }
}

export function useFavorites() {
  const { list, upsert, remove } = useSavedList('favorites')

  const has = (key: string) => list.value.some(f => f.key === key)

  function toggle(item: SavedConversion) {
    if (has(item.key)) {
      remove(item.key)
      toast('Quitado de favoritos')
    }
    else {
      upsert(item)
      toast.success('Agregado a favoritos')
    }
  }

  return { favorites: list, has, toggle }
}

export function useRecent() {
  const { list, upsert, clearAll } = useSavedList('recent')
  return { recent: list, push: upsert, clear: clearAll }
}
