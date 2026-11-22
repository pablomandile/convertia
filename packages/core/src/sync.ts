// Sincronización "local-first" de listas (favoritos, recientes) entre el dispositivo y la cuenta.
//
// Cada ítem lleva la fecha de su último cambio. Al combinar gana el más nuevo, ítem por ítem.
// Los borrados no desaparecen: quedan como lápida (deleted) para que otro dispositivo que todavía
// lo tenga no lo "resucite". Las lápidas viejas se descartan después de TOMBSTONE_DAYS.

export interface SyncItem {
  key: string
  label: string
  href: string
  /** ISO 8601 */
  updatedAt: string
  deleted?: boolean
}

export const TOMBSTONE_DAYS = 60

const time = (iso: string) => {
  const t = Date.parse(iso)
  return Number.isNaN(t) ? 0 : t
}

/** Combina dos versiones de la misma lista: por clave, gana la de `updatedAt` más reciente (empate: local). */
export function mergeItems(local: SyncItem[], remote: SyncItem[]): SyncItem[] {
  const byKey = new Map<string, SyncItem>()
  for (const item of remote) byKey.set(item.key, item)
  for (const item of local) {
    const other = byKey.get(item.key)
    if (!other || time(item.updatedAt) >= time(other.updatedAt)) byKey.set(item.key, item)
  }
  return [...byKey.values()].sort((a, b) => time(b.updatedAt) - time(a.updatedAt))
}

/** Lo que se muestra: sin lápidas, del más nuevo al más viejo, hasta `max`. */
export function visibleItems(items: SyncItem[], max = Infinity): SyncItem[] {
  return items.filter(i => !i.deleted).sort((a, b) => time(b.updatedAt) - time(a.updatedAt)).slice(0, max)
}

/**
 * Deja la lista en orden: lo que excede `max` pasa a lápida (así el recorte también se sincroniza)
 * y las lápidas más viejas que TOMBSTONE_DAYS se descartan.
 */
export function compactItems(items: SyncItem[], max: number, now = new Date()): SyncItem[] {
  const keep = new Set(visibleItems(items, max).map(i => i.key))
  const cutoff = now.getTime() - TOMBSTONE_DAYS * 86400000
  const nowIso = now.toISOString()
  return items
    .map(i => (!i.deleted && !keep.has(i.key) ? { ...i, deleted: true, updatedAt: nowIso } : i))
    .filter(i => !i.deleted || time(i.updatedAt) >= cutoff)
}

/** Ítems que hay que subir: los que la cuenta no tiene o tiene en una versión más vieja. */
export function itemsToPush(merged: SyncItem[], remote: SyncItem[]): SyncItem[] {
  const remoteByKey = new Map(remote.map(i => [i.key, i]))
  return merged.filter((item) => {
    const r = remoteByKey.get(item.key)
    return !r || time(item.updatedAt) > time(r.updatedAt) || Boolean(r.deleted) !== Boolean(item.deleted)
  })
}

/**
 * Convierte el formato viejo de localStorage (sin fecha) al nuevo. Conserva el orden:
 * el primero queda como el más reciente.
 */
export function upgradeLegacyItems(raw: unknown, now = new Date()): SyncItem[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object' && typeof i.key === 'string' && typeof i.href === 'string' && typeof i.label === 'string')
    .map((i, index) => ({
      key: i.key as string,
      label: i.label as string,
      href: i.href as string,
      updatedAt: typeof i.updatedAt === 'string' ? i.updatedAt : new Date(now.getTime() - index * 1000).toISOString(),
      ...(i.deleted ? { deleted: true } : {}),
    }))
}

/** Ajustes: gana el objeto entero más nuevo. */
export function mergeSettings<T extends object>(
  local: { data: T, updatedAt: string } | undefined,
  remote: { data: T, updatedAt: string } | undefined,
): { winner: 'local' | 'remote' | 'none', value?: { data: T, updatedAt: string } } {
  if (!local && !remote) return { winner: 'none' }
  if (!remote) return { winner: 'local', value: local! }
  if (!local) return { winner: 'remote', value: remote }
  return time(local.updatedAt) > time(remote.updatedAt) ? { winner: 'local', value: local } : { winner: 'remote', value: remote }
}
