import { describe, expect, it } from 'vitest'
import { compactItems, itemsToPush, mergeItems, mergeSettings, TOMBSTONE_DAYS, upgradeLegacyItems, visibleItems } from '../src'
import type { SyncItem } from '../src'

const item = (key: string, updatedAt: string, deleted = false): SyncItem => ({ key, label: key, href: `/${key}`, updatedAt, ...(deleted ? { deleted } : {}) })

describe('mergeItems', () => {
  it('une las dos listas y gana el más nuevo por clave', () => {
    const local = [item('a', '2026-01-02T00:00:00Z'), item('b', '2026-01-01T00:00:00Z')]
    const remote = [item('a', '2026-01-01T00:00:00Z'), item('c', '2026-01-03T00:00:00Z')]
    const merged = mergeItems(local, remote)
    expect(merged.map(i => i.key)).toEqual(['c', 'a', 'b'])
    expect(merged.find(i => i.key === 'a')!.updatedAt).toBe('2026-01-02T00:00:00Z')
  })

  it('un borrado más nuevo gana: el ítem no resucita', () => {
    const local = [item('a', '2026-01-01T00:00:00Z')]
    const remote = [item('a', '2026-01-05T00:00:00Z', true)]
    expect(visibleItems(mergeItems(local, remote))).toEqual([])
  })

  it('volver a agregar después de borrar gana', () => {
    const local = [item('a', '2026-01-09T00:00:00Z')]
    const remote = [item('a', '2026-01-05T00:00:00Z', true)]
    expect(visibleItems(mergeItems(local, remote)).map(i => i.key)).toEqual(['a'])
  })

  it('es conmutativo en el resultado visible', () => {
    const a = [item('x', '2026-01-01T00:00:00Z'), item('y', '2026-01-04T00:00:00Z', true)]
    const b = [item('y', '2026-01-02T00:00:00Z'), item('z', '2026-01-03T00:00:00Z')]
    expect(visibleItems(mergeItems(a, b))).toEqual(visibleItems(mergeItems(b, a)))
  })
})

describe('compactItems', () => {
  const now = new Date('2026-06-01T00:00:00Z')

  it('lo que excede el máximo pasa a lápida con fecha nueva', () => {
    const items = [item('a', '2026-05-03T00:00:00Z'), item('b', '2026-05-02T00:00:00Z'), item('c', '2026-05-01T00:00:00Z')]
    const out = compactItems(items, 2, now)
    expect(visibleItems(out).map(i => i.key)).toEqual(['a', 'b'])
    expect(out.find(i => i.key === 'c')).toMatchObject({ deleted: true, updatedAt: now.toISOString() })
  })

  it(`descarta lápidas de más de ${TOMBSTONE_DAYS} días`, () => {
    const old = new Date(now.getTime() - (TOMBSTONE_DAYS + 1) * 86400000).toISOString()
    const recent = new Date(now.getTime() - 5 * 86400000).toISOString()
    const out = compactItems([item('viejo', old, true), item('nuevo', recent, true)], 10, now)
    expect(out.map(i => i.key)).toEqual(['nuevo'])
  })
})

describe('itemsToPush', () => {
  it('sube lo que falta o es más nuevo, y no lo que ya está igual', () => {
    const merged = [item('a', '2026-01-02T00:00:00Z'), item('b', '2026-01-01T00:00:00Z'), item('c', '2026-01-01T00:00:00Z', true)]
    const remote = [item('a', '2026-01-01T00:00:00Z'), item('b', '2026-01-01T00:00:00Z')]
    expect(itemsToPush(merged, remote).map(i => i.key)).toEqual(['a', 'c'])
  })
})

describe('upgradeLegacyItems', () => {
  it('convierte el formato viejo conservando el orden', () => {
    const now = new Date('2026-06-01T00:00:00Z')
    const out = upgradeLegacyItems([{ key: 'a', label: 'A', href: '/a' }, { key: 'b', label: 'B', href: '/b' }, { nada: 1 }, null], now)
    expect(out.map(i => i.key)).toEqual(['a', 'b'])
    expect(visibleItems(out).map(i => i.key)).toEqual(['a', 'b'])
    expect(upgradeLegacyItems('basura')).toEqual([])
  })

  it('respeta los que ya tienen fecha', () => {
    const out = upgradeLegacyItems([{ key: 'a', label: 'A', href: '/a', updatedAt: '2025-01-01T00:00:00Z', deleted: true }])
    expect(out[0]).toEqual({ key: 'a', label: 'A', href: '/a', updatedAt: '2025-01-01T00:00:00Z', deleted: true })
  })
})

describe('mergeSettings', () => {
  it('gana el más nuevo', () => {
    const l = { data: { theme: 'dark' }, updatedAt: '2026-01-02T00:00:00Z' }
    const r = { data: { theme: 'light' }, updatedAt: '2026-01-01T00:00:00Z' }
    expect(mergeSettings(l, r).winner).toBe('local')
    expect(mergeSettings(undefined, r).winner).toBe('remote')
    expect(mergeSettings(undefined, undefined).winner).toBe('none')
  })
})
