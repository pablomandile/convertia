// Cocina: medidas de volumen ↔ peso según el ingrediente, horno y escalar recetas.
// Las densidades son orientativas (harina sin tamizar, cargada con cuchara y enrasada).

export interface Ingredient {
  id: string
  name: string
  /** Gramos por mililitro. */
  density: number
}

export const INGREDIENTS: Ingredient[] = [
  { id: 'agua', name: 'Agua', density: 1 },
  { id: 'harina', name: 'Harina común (000 / 0000)', density: 0.53 },
  { id: 'harina-integral', name: 'Harina integral', density: 0.55 },
  { id: 'maicena', name: 'Almidón de maíz (maicena)', density: 0.54 },
  { id: 'azucar', name: 'Azúcar común', density: 0.84 },
  { id: 'azucar-impalpable', name: 'Azúcar impalpable', density: 0.48 },
  { id: 'azucar-negra', name: 'Azúcar negra (compactada)', density: 0.9 },
  { id: 'manteca', name: 'Manteca', density: 0.96 },
  { id: 'aceite', name: 'Aceite', density: 0.92 },
  { id: 'leche', name: 'Leche', density: 1.03 },
  { id: 'crema', name: 'Crema de leche', density: 0.99 },
  { id: 'yogur', name: 'Yogur', density: 1.03 },
  { id: 'miel', name: 'Miel', density: 1.42 },
  { id: 'dulce-de-leche', name: 'Dulce de leche', density: 1.3 },
  { id: 'cacao', name: 'Cacao amargo en polvo', density: 0.36 },
  { id: 'avena', name: 'Avena arrollada', density: 0.38 },
  { id: 'arroz', name: 'Arroz crudo', density: 0.78 },
  { id: 'sal', name: 'Sal fina', density: 1.2 },
  { id: 'pan-rallado', name: 'Pan rallado', density: 0.47 },
  { id: 'queso-rallado', name: 'Queso rallado', density: 0.42 },
  { id: 'coco', name: 'Coco rallado', density: 0.36 },
  { id: 'nueces', name: 'Nueces picadas', density: 0.48 },
  { id: 'chips', name: 'Chips de chocolate', density: 0.72 },
]

export interface KitchenMeasure {
  id: string
  name: string
  kind: 'volume' | 'mass'
  /** Mililitros (volumen) o gramos (masa) por unidad. */
  amount: number
}

export const KITCHEN_MEASURES: KitchenMeasure[] = [
  { id: 'taza', name: 'Taza (250 ml)', kind: 'volume', amount: 250 },
  { id: 'taza-us', name: 'Taza EE. UU. (237 ml)', kind: 'volume', amount: 236.5882365 },
  { id: 'cda', name: 'Cucharada (15 ml)', kind: 'volume', amount: 15 },
  { id: 'cdita', name: 'Cucharadita (5 ml)', kind: 'volume', amount: 5 },
  { id: 'ml', name: 'Mililitros', kind: 'volume', amount: 1 },
  { id: 'l', name: 'Litros', kind: 'volume', amount: 1000 },
  { id: 'floz', name: 'Onzas líquidas', kind: 'volume', amount: 29.5735295625 },
  { id: 'g', name: 'Gramos', kind: 'mass', amount: 1 },
  { id: 'kg', name: 'Kilos', kind: 'mass', amount: 1000 },
  { id: 'oz', name: 'Onzas', kind: 'mass', amount: 28.349523125 },
  { id: 'lb', name: 'Libras', kind: 'mass', amount: 453.59237 },
]

export function convertIngredient(value: number, fromId: string, toId: string, ingredientId: string): number {
  const from = KITCHEN_MEASURES.find(m => m.id === fromId)
  const to = KITCHEN_MEASURES.find(m => m.id === toId)
  const ingredient = INGREDIENTS.find(i => i.id === ingredientId)
  if (!from || !to) throw new RangeError('Medida desconocida')
  if (!ingredient) throw new RangeError('Ingrediente desconocido')
  // Todo pasa por gramos.
  const grams = from.kind === 'mass' ? value * from.amount : value * from.amount * ingredient.density
  return to.kind === 'mass' ? grams / to.amount : grams / ingredient.density / to.amount
}

// --- Horno ------------------------------------------------------------------------------

// Marca de gas (hornos británicos) ↔ °C, según la tabla de uso habitual.
const GAS_MARKS: Array<[number, number]> = [[1, 140], [2, 150], [3, 170], [4, 180], [5, 190], [6, 200], [7, 220], [8, 230], [9, 240]]

export function ovenLabel(celsius: number): string {
  if (celsius < 140) return 'Muy suave'
  if (celsius < 165) return 'Suave'
  if (celsius < 185) return 'Moderado'
  if (celsius < 205) return 'Moderado a fuerte'
  if (celsius < 230) return 'Fuerte'
  return 'Muy fuerte'
}

export function oven(celsius: number) {
  const gas = celsius < 130 || celsius > 250
    ? undefined
    : GAS_MARKS.reduce((best, [mark, c]) => Math.abs(c - celsius) < Math.abs(best[1] - celsius) ? [mark, c] : best)[0]
  return {
    celsius,
    fahrenheit: Math.round(celsius * 9 / 5 + 32),
    /** Horno con ventilador: unos 20 °C menos para el mismo resultado. */
    fan: celsius - 20,
    gas,
    label: ovenLabel(celsius),
  }
}

export const OVEN_TABLE = GAS_MARKS.map(([, c]) => oven(c))

// --- Escalar recetas --------------------------------------------------------------------

const UNICODE_FRACTIONS: Record<string, number> = { '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': 0.125 }
const NICE: Array<[number, string]> = [[0.125, '⅛'], [0.25, '¼'], [1 / 3, '⅓'], [0.5, '½'], [2 / 3, '⅔'], [0.75, '¾']]

/** "1 1/2", "1½", "½", "1,5", "3/4" → número. */
export function parseQuantity(text: string): number | undefined {
  const s = text.trim()
  let m = s.match(/^(\d+)\s*([¼½¾⅓⅔⅛])$/)
  if (m) return Number(m[1]) + UNICODE_FRACTIONS[m[2]!]!
  if (UNICODE_FRACTIONS[s] !== undefined) return UNICODE_FRACTIONS[s]
  m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  if (m) return Number(m[1]) + Number(m[2]) / Number(m[3])
  m = s.match(/^(\d+)\/(\d+)$/)
  if (m) return Number(m[1]) / Number(m[2])
  m = s.match(/^\d+(?:[.,]\d+)?$/)
  if (m) return Number(s.replace(',', '.'))
  return undefined
}

/** Cantidades de cocina legibles: 1,5 → "1 ½", 0,33 → "⅓", 2,4 → "2,4", 250 → "250". */
export function formatQuantity(n: number): string {
  if (n >= 10) return String(Math.round(n * 10) / 10).replace('.', ',')
  const whole = Math.floor(n)
  const frac = n - whole
  if (frac < 0.04) return String(whole)
  if (frac > 0.96) return String(whole + 1)
  const nice = NICE.find(([v]) => Math.abs(v - frac) < 0.04)
  if (nice) return whole ? `${whole} ${nice[1]}` : nice[1]
  return String(Math.round(n * 100) / 100).replace('.', ',')
}

const QUANTITY = /(\d+\s+\d+\/\d+|\d+\s*[¼½¾⅓⅔⅛]|\d+\/\d+|[¼½¾⅓⅔⅛]|\d+(?:[.,]\d+)?)/
// Líneas que hablan de tiempo o temperatura: no se escalan.
const SKIP = /°|grados|\bmin(utos)?\b|\bhoras?\b|\bhorno\b|\bseg(undos)?\b/i

/**
 * Escala cada línea de una receta multiplicando la primera cantidad que aparece.
 * Deja como están las líneas de horno y tiempos.
 */
export function scaleRecipe(text: string, factor: number): string {
  return text.split('\n').map((line) => {
    if (SKIP.test(line)) return line
    const m = line.match(QUANTITY)
    if (!m || m.index === undefined) return line
    const q = parseQuantity(m[0])
    if (q === undefined) return line
    return line.slice(0, m.index) + formatQuantity(q * factor) + line.slice(m.index + m[0].length)
  }).join('\n')
}
