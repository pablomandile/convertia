// Herramientas de números: romanos, bases y número a letras (español).

// --- Romanos ------------------------------------------------------------------

const ROMAN: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
]

/** 1 a 3999 → "MMXXVI". */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > 3999) throw new RangeError('Los números romanos van de 1 a 3999')
  let rest = n
  let out = ''
  for (const [value, symbol] of ROMAN) {
    while (rest >= value) {
      out += symbol
      rest -= value
    }
  }
  return out
}

/** "MMXXVI" → 2026. Rechaza formas no canónicas ("IIII", "VX", "IC"). */
export function fromRoman(text: string): number {
  const s = text.trim().toUpperCase()
  if (!/^[MDCLXVI]+$/.test(s)) throw new RangeError('Solo se admiten las letras M, D, C, L, X, V e I')
  const values: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 }
  let total = 0
  for (let i = 0; i < s.length; i++) {
    const current = values[s[i]!]!
    const next = values[s[i + 1] ?? ''] ?? 0
    total += current < next ? -current : current
  }
  if (total < 1 || total > 3999 || toRoman(total) !== s) throw new RangeError(`«${s}» no es un número romano válido`)
  return total
}

// --- Bases ---------------------------------------------------------------------

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz'

/** Entero (sin límite de tamaño) escrito en `base` (2 a 36) → BigInt. Admite "0x", "0b", "0o", espacios y "_". */
export function parseInBase(text: string, base: number): bigint {
  if (!Number.isInteger(base) || base < 2 || base > 36) throw new RangeError('La base va de 2 a 36')
  let s = text.trim().toLowerCase().replace(/[\s_]/g, '')
  let negative = false
  if (s.startsWith('-')) {
    negative = true
    s = s.slice(1)
  }
  const prefix = { 16: '0x', 2: '0b', 8: '0o' }[base as 2 | 8 | 16]
  if (prefix && s.startsWith(prefix)) s = s.slice(2)
  if (!s) throw new RangeError('Falta el número')
  let value = 0n
  const b = BigInt(base)
  for (const char of s) {
    const digit = DIGITS.indexOf(char)
    if (digit < 0 || digit >= base) throw new RangeError(`«${char}» no es un dígito válido en base ${base}`)
    value = value * b + BigInt(digit)
  }
  return negative ? -value : value
}

export function formatInBase(value: bigint, base: number): string {
  if (!Number.isInteger(base) || base < 2 || base > 36) throw new RangeError('La base va de 2 a 36')
  return value.toString(base).toUpperCase()
}

/** Agrupa dígitos para leerlos mejor: binario de a 4, hexadecimal de a 2, decimal de a 3. */
export function groupDigits(text: string, size: number, separator = ' '): string {
  const negative = text.startsWith('-')
  const digits = negative ? text.slice(1) : text
  const groups: string[] = []
  for (let end = digits.length; end > 0; end -= size) groups.unshift(digits.slice(Math.max(0, end - size), end))
  return (negative ? '-' : '') + groups.join(separator)
}

// --- Número a letras ------------------------------------------------------------------

const UNITS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

/** "uno" → "un" delante de un sustantivo: veintiún mil, treinta y un millones, un peso. */
function apocope(words: string): string {
  return words.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un')
}

function below1000(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cien'
  const h = Math.floor(n / 100)
  const rest = n % 100
  const parts: string[] = []
  if (h) parts.push(HUNDREDS[h]!)
  if (rest) {
    if (rest < 30) parts.push(UNITS[rest]!)
    else {
      const t = Math.floor(rest / 10)
      const u = rest % 10
      parts.push(u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t]!)
    }
  }
  return parts.join(' ')
}

function below1e6(n: number): string {
  const thousands = Math.floor(n / 1000)
  const rest = n % 1000
  const parts: string[] = []
  if (thousands === 1) parts.push('mil')
  else if (thousands > 1) parts.push(`${apocope(below1000(thousands))} mil`)
  if (rest) parts.push(below1000(rest))
  return parts.join(' ')
}

/**
 * Entero no negativo a letras, escala larga (billón = 10¹²), hasta 999.999 billones.
 * `apocopar: true` para delante de un sustantivo: "veintiún", "un millón"… → "un peso".
 */
export function integerToWords(value: bigint | number, options: { apocopar?: boolean } = {}): string {
  const n = BigInt(value)
  if (n < 0n) return `menos ${integerToWords(-n, options)}`
  if (n === 0n) return 'cero'
  if (n >= 10n ** 18n) throw new RangeError('Demasiado grande (hasta 999.999 billones)')

  const billions = Number(n / 10n ** 12n)
  const millions = Number((n / 10n ** 6n) % 10n ** 6n)
  const rest = Number(n % 10n ** 6n)
  const parts: string[] = []
  if (billions) parts.push(billions === 1 ? 'un billón' : `${apocope(below1e6(billions))} billones`)
  if (millions) parts.push(millions === 1 ? 'un millón' : `${apocope(below1e6(millions))} millones`)
  if (rest) parts.push(below1e6(rest))
  const words = parts.join(' ')
  return options.apocopar ? apocope(words) : words
}

/** Antes de "de pesos": "un millón de pesos", pero "un millón doscientos pesos". */
function needsDe(n: bigint): boolean {
  return n > 0n && n % 1000000n === 0n
}

/**
 * Monto en letras para cheques, recibos y facturas.
 * 1234.5 → "Mil doscientos treinta y cuatro pesos con 50/100"
 */
export function amountToWords(amount: string | number, currency: { singular: string, plural: string } = { singular: 'peso', plural: 'pesos' }, style: 'fraccion' | 'centavos' = 'fraccion'): string {
  const text = typeof amount === 'number' ? amount.toFixed(2) : amount.trim()
  const m = text.match(/^(-?)(\d+)(?:\.(\d{1,2}))?$/)
  if (!m) throw new RangeError('Monto inválido')
  const integer = BigInt(m[2]!)
  const cents = Number((m[3] ?? '0').padEnd(2, '0'))
  const name = integer === 1n ? currency.singular : currency.plural
  let words = `${integerToWords(integer, { apocopar: true })} ${needsDe(integer) ? 'de ' : ''}${name}`
  if (style === 'fraccion') words += ` con ${String(cents).padStart(2, '0')}/100`
  else if (cents) words += ` con ${integerToWords(cents, { apocopar: true })} ${cents === 1 ? 'centavo' : 'centavos'}`
  words = (m[1] ? 'menos ' : '') + words
  return words.charAt(0).toUpperCase() + words.slice(1)
}
