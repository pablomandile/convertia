import Decimal from 'decimal.js-light'
import type { CategoryDef, UnitDef } from './types'
import { categories } from './categories'

Decimal.set({ precision: 40 })

export type Numeric = number | string | Decimal

/** Acepta "0.3048", "1e-9" o fracciones "5/9". */
function parseDef(value: string): Decimal {
  const slash = value.indexOf('/')
  if (slash === -1) return new Decimal(value)
  return new Decimal(value.slice(0, slash)).div(value.slice(slash + 1))
}

const byCategory = new Map<string, CategoryDef>()
const unitIndex = new Map<string, { category: CategoryDef, unit: UnitDef }>()

for (const category of categories) {
  byCategory.set(category.id, category)
  byCategory.set(category.slug, category)
  for (const unit of category.units) {
    unitIndex.set(`${category.id}:${unit.id}`, { category, unit })
  }
}

export function getCategory(idOrSlug: string): CategoryDef | undefined {
  return byCategory.get(idOrSlug)
}

export function getUnit(categoryId: string, unitId: string): UnitDef | undefined {
  const category = getCategory(categoryId)
  return category ? unitIndex.get(`${category.id}:${unitId}`)?.unit : undefined
}

export function toBase(value: Decimal, unit: UnitDef): Decimal {
  const factor = parseDef(unit.factor)
  if (unit.inverse) return factor.div(value)
  const offset = unit.offset ? parseDef(unit.offset) : new Decimal(0)
  return value.mul(factor).plus(offset)
}

export function fromBase(base: Decimal, unit: UnitDef): Decimal {
  const factor = parseDef(unit.factor)
  if (unit.inverse) return factor.div(base)
  const offset = unit.offset ? parseDef(unit.offset) : new Decimal(0)
  return base.minus(offset).div(factor)
}

/**
 * Convierte `value` de una unidad a otra dentro de una categoría.
 * Devuelve un Decimal con precisión completa; formatear para mostrar.
 */
export function convert(value: Numeric, categoryId: string, fromId: string, toId: string): Decimal {
  const category = getCategory(categoryId)
  if (!category) throw new Error(`Categoría desconocida: ${categoryId}`)
  const from = getUnit(category.id, fromId)
  const to = getUnit(category.id, toId)
  if (!from) throw new Error(`Unidad desconocida en ${category.slug}: ${fromId}`)
  if (!to) throw new Error(`Unidad desconocida en ${category.slug}: ${toId}`)
  const input = value instanceof Decimal ? value : new Decimal(value)
  return fromBase(toBase(input, from), to)
}

/** Un valor convertido a todas las unidades de su categoría. */
export function convertToAll(value: Numeric, categoryId: string, fromId: string): Array<{ unit: UnitDef, value: Decimal }> {
  const category = getCategory(categoryId)
  if (!category) throw new Error(`Categoría desconocida: ${categoryId}`)
  return category.units.map(unit => ({ unit, value: convert(value, category.id, fromId, unit.id) }))
}

/**
 * Redondea a `significant` cifras significativas y quita ceros sobrantes.
 * Devuelve un número JS listo para Intl.NumberFormat.
 */
export function round(value: Decimal, significant = 10): number {
  if (value.isZero()) return 0
  return Number(value.toSignificantDigits(significant).toString())
}
