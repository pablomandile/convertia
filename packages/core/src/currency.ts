import Decimal from 'decimal.js-light'
import { normalize } from './slug'

/**
 * Cotizaciones: cuántas unidades de cada moneda equivalen a 1 USD.
 * Es el formato de /api/v1/rates.json (campo `rates`).
 */
export type Rates = Record<string, number>

/** Nombres comunes en español que el parser reconoce como monedas. */
export const currencyAliases: Record<string, string> = {
  'dolar': 'USD',
  'dolares': 'USD',
  'u$s': 'USD',
  'us$': 'USD',
  'usd': 'USD',
  'peso': 'ARS',
  'pesos': 'ARS',
  'peso argentino': 'ARS',
  'pesos argentinos': 'ARS',
  'peso mexicano': 'MXN',
  'pesos mexicanos': 'MXN',
  'peso chileno': 'CLP',
  'pesos chilenos': 'CLP',
  'peso uruguayo': 'UYU',
  'pesos uruguayos': 'UYU',
  'peso colombiano': 'COP',
  'pesos colombianos': 'COP',
  'euro': 'EUR',
  'euros': 'EUR',
  '€': 'EUR',
  'real': 'BRL',
  'reales': 'BRL',
  'libra esterlina': 'GBP',
  'libras esterlinas': 'GBP',
  'yen': 'JPY',
  'yenes': 'JPY',
  'yuan': 'CNY',
  'yuanes': 'CNY',
  'franco suizo': 'CHF',
  'francos suizos': 'CHF',
  'sol': 'PEN',
  'soles': 'PEN',
  'guarani': 'PYG',
  'guaranies': 'PYG',
  'boliviano': 'BOB',
  'bolivianos': 'BOB',
  'bitcoin': 'BTC',
  'bitcoins': 'BTC',
  'ether': 'ETH',
  'ethereum': 'ETH',
  'oro': 'XAU',
  'plata': 'XAG',
}

/** Devuelve el código ISO si `text` es un código conocido o un alias. */
export function resolveCurrency(text: string, rates?: Rates): string | undefined {
  const clean = normalize(text)
  const alias = currencyAliases[clean]
  if (alias) return alias
  const code = clean.toUpperCase()
  if (!/^[A-Z]{3,5}$/.test(code)) return undefined
  if (rates) return code in rates ? code : undefined
  return code
}

export function convertCurrency(value: number | string | Decimal, from: string, to: string, rates: Rates): Decimal {
  const rFrom = rates[from]
  const rTo = rates[to]
  if (!rFrom) throw new Error(`Sin cotización para ${from}`)
  if (!rTo) throw new Error(`Sin cotización para ${to}`)
  const input = value instanceof Decimal ? value : new Decimal(value)
  return input.div(rFrom).mul(rTo)
}

const displayNames = new Map<string, Intl.DisplayNames | null>()

/** Nombre de la moneda en el idioma pedido, usando los datos de Intl del navegador. */
export function currencyName(code: string, locale = 'es'): string {
  if (!displayNames.has(locale)) {
    try {
      displayNames.set(locale, new Intl.DisplayNames([locale], { type: 'currency' }))
    }
    catch {
      displayNames.set(locale, null)
    }
  }
  const extra: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ether',
    USDT: 'Tether',
    USDC: 'USD Coin',
    SOL: 'Solana',
    XAU: 'Oro (onza troy)',
    XAG: 'Plata (onza troy)',
  }
  if (extra[code]) return extra[code]
  let name: string | undefined
  try {
    // Lanza RangeError con códigos que no son de 3 letras (USDC, etc.): nunca debe romper la página.
    name = displayNames.get(locale)?.of(code)
  }
  catch {
    name = undefined
  }
  if (!name || name === code) return code
  return name.charAt(0).toUpperCase() + name.slice(1)
}
