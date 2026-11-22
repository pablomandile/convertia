import { itemsToPush, mergeItems, mergeSettings, TOMBSTONE_DAYS, type SyncItem } from '@convertia/core'
import type { SupabaseClient } from '@supabase/supabase-js'

type Status = 'off' | 'idle' | 'syncing' | 'error' | 'offline'

/**
 * La sincronización corre en timers y después de varios await, donde Nuxt ya no tiene contexto
 * activo: todo lo que necesita (estado, cliente, listas) se captura UNA vez, la primera vez que se
 * llama useSync() dentro de un contexto válido (setup o plugin), y después se usa esta referencia.
 */
interface SyncContext {
  supabase: SupabaseClient | null
  status: Ref<Status>
  lastSync: Ref<string | null>
  lastError: Ref<string | null>
  canSync: () => boolean
  stores: Record<SavedListName, ReturnType<typeof useSavedStore>>
  settingsRefs: SettingsRefs
}

let ctx: SyncContext | null = null
let timer: ReturnType<typeof setTimeout> | undefined
let running: Promise<void> | null = null
let again = false

function context(): SyncContext {
  if (ctx) return ctx
  const nuxtApp = useNuxtApp()
  const user = useState<{ id: string } | null>('auth:user')
  const profile = useState<{ terms_version: string | null } | null>('auth:profile')
  const created: SyncContext = {
    supabase: nuxtApp.$supabase as SupabaseClient | null,
    status: useState<Status>('sync:status', () => 'off'),
    lastSync: useState<string | null>('sync:last', () => null),
    lastError: useState<string | null>('sync:error', () => null),
    canSync: () => !!user.value && profile.value?.terms_version === LEGAL_VERSION,
    stores: { favorites: useSavedStore('favorites'), recent: useSavedStore('recent') },
    settingsRefs: useSettingsRefs(),
  }
  // En el servidor (prerender) no se guarda: cada render tiene su propio estado.
  if (import.meta.client) ctx = created
  return created
}

async function run(c: SyncContext) {
  if (!c.supabase || !c.canSync()) {
    c.status.value = 'off'
    return
  }
  if (!navigator.onLine) {
    c.status.value = 'offline'
    return
  }
  const supabase = c.supabase
  c.status.value = 'syncing'
  try {
    for (const list of ['favorites', 'recent'] as const) {
      const store = c.stores[list]
      store.ensureLoaded()
      const { data, error } = await supabase.from('user_items').select('key, label, href, deleted, updated_at').eq('list', list)
      if (error) throw error
      const remote: SyncItem[] = (data ?? []).map(r => ({ key: r.key, label: r.label, href: r.href, updatedAt: r.updated_at, ...(r.deleted ? { deleted: true } : {}) }))
      store.set(mergeItems(store.items.value, remote), { sync: false })
      const push = itemsToPush(store.items.value, remote)
      if (push.length) {
        const { error: e } = await supabase.from('user_items').upsert(push.map(i => ({
          list, key: i.key, label: i.label, href: i.href, deleted: !!i.deleted, updated_at: i.updatedAt,
        })))
        if (e) throw e
      }
      // Las lápidas viejas ya se descartaron en el dispositivo: también se borran en la cuenta.
      const cutoff = new Date(Date.now() - TOMBSTONE_DAYS * 86400000).toISOString()
      await supabase.from('user_items').delete().eq('list', list).eq('deleted', true).lt('updated_at', cutoff)
    }

    const { data: row, error: se } = await supabase.from('user_settings').select('data, updated_at').maybeSingle()
    if (se) throw se
    const local = readLocalSettings()
    const remoteSettings = row ? { data: row.data as SettingsData, updatedAt: row.updated_at as string } : undefined
    const merged = mergeSettings(local, remoteSettings)
    if (merged.winner === 'local' && merged.value && merged.value.updatedAt !== remoteSettings?.updatedAt) {
      const { error: e } = await supabase.from('user_settings').upsert({ data: merged.value.data, updated_at: merged.value.updatedAt })
      if (e) throw e
    }
    else if (merged.winner === 'remote' && merged.value && merged.value.updatedAt !== local?.updatedAt) {
      applyRemoteSettings(merged.value, c.settingsRefs)
    }

    c.lastSync.value = new Date().toISOString()
    c.lastError.value = null
    c.status.value = 'idle'
  }
  catch (error) {
    c.lastError.value = (error as { message?: string })?.message ?? String(error)
    c.status.value = navigator.onLine ? 'error' : 'offline'
  }
}

/**
 * Sincroniza favoritos, recientes y ajustes con la cuenta. Local primero: el dispositivo siempre tiene
 * su copia, y esto la combina con la de la cuenta (gana lo más nuevo, ítem por ítem).
 */
export function useSync() {
  const c = context()

  async function syncNow(): Promise<void> {
    if (import.meta.server) return
    if (running) {
      again = true
      return running
    }
    running = run(c).finally(() => {
      running = null
      if (again) {
        again = false
        syncNow()
      }
    })
    return running
  }

  /** Después de un cambio local: espera un momento para juntar varios cambios en un solo envío. */
  function requestSync() {
    if (import.meta.server) return
    clearTimeout(timer)
    timer = setTimeout(syncNow, 1500)
  }

  function reset() {
    clearTimeout(timer)
    c.status.value = 'off'
    c.lastSync.value = null
    c.lastError.value = null
  }

  return { status: c.status, lastSync: c.lastSync, lastError: c.lastError, syncNow, requestSync, reset }
}
