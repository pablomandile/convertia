import type { CategoryDef, UnitDef } from './types'

/** Minúsculas y sin acentos: "Kilómetro" → "kilometro". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function slugify(text: string): string {
  return normalize(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Plural en español del nombre de la unidad (o el definido en `plural`). */
export function unitPlural(unit: UnitDef): string {
  if (unit.plural) return unit.plural
  const name = unit.name.es
  if (/[aeiouáéíóú]$/i.test(name) || /t$/i.test(name)) return `${name}s`
  return `${name}es`
}

/** Slug de la unidad para la URL: "pies", "grados-celsius". */
export function unitSlug(unit: UnitDef): string {
  return slugify(unitPlural(unit))
}

/** "pies-a-metros" */
export function pairSlug(from: UnitDef, to: UnitDef): string {
  return `${unitSlug(from)}-a-${unitSlug(to)}`
}

/** Inverso de pairSlug dentro de una categoría. */
export function parsePairSlug(category: CategoryDef, slug: string): { from: UnitDef, to: UnitDef } | undefined {
  const bySlug = new Map(category.units.map(u => [unitSlug(u), u]))
  const parts = slug.split('-a-')
  // Los slugs no contienen "-a-" (lo verifica un test), así que hay exactamente un corte posible.
  if (parts.length !== 2) return undefined
  const from = bySlug.get(parts[0]!)
  const to = bySlug.get(parts[1]!)
  return from && to ? { from, to } : undefined
}
