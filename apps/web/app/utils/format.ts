import type { Decimal } from '@convertia/core'

const plain = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 10 })
const money = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const SUPERSCRIPT: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }

/**
 * Formato argentino. Muy grandes o muy chicos van en notación científica (1,23 × 10⁻⁹),
 * el resto con hasta 10 cifras significativas: 0,3048 · 1.609,344 · 2.204622622
 */
export function formatNumber(value: Decimal, significant = 10): string {
  if (value.isZero()) return '0'
  const abs = value.abs()
  if (abs.gte('1e15') || abs.lt('1e-6')) {
    const [mantissa, exp] = value.toExponential(Math.min(significant, 6) - 1).split('e')
    const m = plain.format(Number(mantissa))
    const e = String(Number(exp)).split('').map(c => SUPERSCRIPT[c] ?? c).join('')
    return `${m} × 10${e}`
  }
  return plain.format(Number(value.toSignificantDigits(significant).toString()))
}

/** Montos de dinero: dos decimales, salvo valores chicos (cripto) que necesitan más. */
export function formatMoney(value: Decimal): string {
  const abs = value.abs()
  if (!abs.isZero() && abs.lt(1)) return formatNumber(value, 6)
  return money.format(Number(value.toFixed(2)))
}

const pesos = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** $ 1.234,56 */
export function formatPesos(n: number): string {
  return Number.isFinite(n) ? pesos.format(n) : '—'
}

/** 3,25 % (con signo opcional: +3,25 %) */
export function formatPct(n: number | undefined, digits = 2, signed = false): string {
  if (n === undefined || !Number.isFinite(n)) return '—'
  const text = n.toLocaleString('es-AR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
  return `${signed && n > 0 ? '+' : ''}${text} %`
}

/** Valor para poner en la URL (?v=): con punto decimal, sin separadores. */
export function toQueryValue(value: Decimal | string): string {
  return typeof value === 'string' ? value : value.toString()
}
