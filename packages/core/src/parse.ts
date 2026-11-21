import Decimal from 'decimal.js-light'
import { categories } from './categories'
import { fromBase, toBase } from './convert'
import { resolveCurrency, type Rates } from './currency'
import { normalize, unitPlural } from './slug'
import type { CategoryDef, UnitDef } from './types'

export type ParseResult =
  | { kind: 'unit', value: Decimal, category: CategoryDef, from: UnitDef, to?: UnitDef }
  | { kind: 'currency', value: Decimal, from: string, to?: string }

type Candidate = { category: CategoryDef, unit: UnitDef }

/**
 * Interpreta un número escrito a mano, con la convención argentina por defecto:
 * "1,5" = 1.5 · "1.500" = 1500 · "1.500,25" = 1500.25 · "1,500.25" = 1500.25 · "0.25" = 0.25
 */
export function parseNumber(raw: string): Decimal | undefined {
  let s = raw.trim().replace(/\s+/g, '')
  if (!/^[-+]?(?:\d[\d.,]*|[.,]\d+)(?:e[-+]?\d+)?$/i.test(s)) return undefined
  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  if (lastDot >= 0 && lastComma >= 0) {
    const decimal = lastDot > lastComma ? '.' : ','
    s = s.split(decimal === '.' ? ',' : '.').join('').replace(',', '.')
  }
  else if (lastComma >= 0) {
    s = s.split(',').length > 2 ? s.replace(/,/g, '') : s.replace(',', '.')
  }
  else if (lastDot >= 0) {
    // Varios puntos, o "1.500" (1 a 3 dígitos sin cero inicial + 3 dígitos): separador de miles.
    if (s.split('.').length > 2 || /^[-+]?[1-9]\d{0,2}\.\d{3}$/.test(s)) s = s.replace(/\./g, '')
  }
  try {
    return new Decimal(s)
  }
  catch {
    return undefined
  }
}

// Índices de unidades: primero coincidencia exacta (respeta mayúsculas: "MB" ≠ "mb"),
// después normalizada (sin acentos ni mayúsculas, con nombres, plurales y alias).
const exactIndex = new Map<string, Candidate[]>()
const normalIndex = new Map<string, Candidate[]>()

function add(index: Map<string, Candidate[]>, key: string, candidate: Candidate) {
  if (!key) return
  const list = index.get(key) ?? []
  if (!list.some(c => c.category === candidate.category && c.unit === candidate.unit)) list.push(candidate)
  index.set(key, list)
}

for (const category of categories) {
  for (const unit of category.units) {
    const c = { category, unit }
    add(exactIndex, unit.id, c)
    add(exactIndex, unit.symbol, c)
    for (const key of [unit.id, unit.symbol, unit.name.es, unit.name.en, unitPlural(unit), ...(unit.aliases ?? [])]) {
      add(normalIndex, normalize(key), c)
    }
  }
}

export function findUnits(text: string): Candidate[] {
  const t = text.trim()
  return exactIndex.get(t) ?? normalIndex.get(normalize(t)) ?? []
}

interface Part { num: string, unit: string }

function splitParts(left: string): Part[] | undefined {
  const parts: Array<{ num: string, unit: string[] }> = []
  for (const token of left.trim().split(/\s+/)) {
    const m = token.match(/^([-+]?[\d.,]*\d(?:e[-+]?\d+)?)(.*)$/i)
    if (m) {
      parts.push({ num: m[1]!, unit: m[2] ? [m[2]] : [] })
    }
    else {
      const current = parts.at(-1)
      if (!current) return undefined
      current.unit.push(token)
    }
  }
  return parts.length ? parts.map(p => ({ num: p.num, unit: p.unit.join(' ') })) : undefined
}

function parseSide(left: string, right: string | undefined, rates?: Rates): ParseResult | undefined {
  const parts = splitParts(left)
  if (!parts) return undefined
  const values = parts.map(p => parseNumber(p.num))
  if (values.some(v => !v)) return undefined

  // ¿Unidades? Buscar una categoría común a todas las partes y al destino.
  if (parts.every(p => p.unit)) {
    const partCandidates = parts.map(p => findUnits(p.unit))
    const targetCandidates = right !== undefined ? findUnits(right) : undefined
    for (const first of partCandidates[0]!) {
      const category = first.category
      const units = partCandidates.map(list => list.find(c => c.category === category)?.unit)
      if (units.some(u => !u)) continue
      const to = targetCandidates?.find(c => c.category === category)?.unit
      if (targetCandidates && !to) continue
      let base = new Decimal(0)
      units.forEach((u, i) => { base = base.plus(toBase(values[i]!, u!)) })
      const from = units[0]!
      const value = parts.length === 1 ? values[0]! : fromBase(base, from)
      return to ? { kind: 'unit', value, category, from, to } : { kind: 'unit', value, category, from }
    }
  }

  // ¿Monedas? Solo un valor ("100 usd a ars", "50 euros en pesos").
  if (parts.length === 1 && parts[0]!.unit) {
    const from = resolveCurrency(parts[0]!.unit, rates)
    if (!from) return undefined
    if (right === undefined) return { kind: 'currency', value: values[0]!, from }
    const to = resolveCurrency(right, rates)
    if (to) return { kind: 'currency', value: values[0]!, from, to }
  }
  return undefined
}

// Conectores entre origen y destino. Las palabras van entre espacios (sin consumirlos,
// para que "10 in a cm" encuentre tanto "in" como "a").
const CONNECTOR = /(?<=\s)(?:a|en|to|in|>)(?=\s)|->|=>|→|=/gi

/**
 * Interpreta la barra inteligente: "100 usd a ars", "5 ft 10 in en cm", "10km", "72 f a c".
 * Sin destino ("10 km") devuelve solo el origen, para mostrar todas las unidades.
 */
export function parseQuery(text: string, options: { rates?: Rates } = {}): ParseResult | undefined {
  const input = text.trim()
  if (!input) return undefined
  const connectors = [...input.matchAll(CONNECTOR)].reverse()
  for (const m of connectors) {
    const left = input.slice(0, m.index)
    const right = input.slice(m.index + m[0].length).trim()
    if (!left.trim() || !right) continue
    const result = parseSide(left, right, options.rates)
    if (result) return result
  }
  return parseSide(input, undefined, options.rates)
}
