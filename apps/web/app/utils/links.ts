import { pairSlug, type CategoryDef, type UnitDef } from '@convertia/core'
import { currencyPairPath } from './popular'

export function unitPairPath(category: CategoryDef, from: UnitDef, to: UnitDef, value?: string): string {
  const path = `/${category.slug}/${pairSlug(from, to)}`
  return value && value !== '1' ? `${path}?v=${encodeURIComponent(value)}` : path
}

export function currencyPairHref(from: string, to: string, value?: string): string {
  const path = currencyPairPath(from, to)
  return value && value !== '1' ? `${path}?v=${encodeURIComponent(value)}` : path
}

/** Destino por defecto cuando el usuario no dice a qué convertir. */
export function defaultTarget(category: CategoryDef, from: UnitDef): UnitDef {
  const popular = category.popular?.find(([f]) => f === from.id)?.[1]
  const id = popular ?? (from.id === category.baseUnit ? category.units.find(u => u.id !== from.id)!.id : category.baseUnit)
  return category.units.find(u => u.id === id)!
}
