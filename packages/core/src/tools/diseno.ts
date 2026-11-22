// Diseño y pantalla: colores, unidades CSS y densidad de pantallas.

export interface RGBA { r: number, g: number, b: number, a: number }

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

/** "#0f766e", "#0f7", "#0f766ecc", "rgb(15 118 110)", "rgb(15, 118, 110, .8)", "hsl(175 77% 26%)", "15,118,110". */
export function parseColor(input: string): RGBA | undefined {
  const s = input.trim().toLowerCase()
  let m = s.match(/^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/)
  if (m) {
    let hex = m[1]!
    if (hex.length <= 4) hex = hex.split('').map(c => c + c).join('')
    const n = (i: number) => Number.parseInt(hex.slice(i, i + 2), 16)
    return { r: n(0), g: n(2), b: n(4), a: hex.length === 8 ? Math.round(n(6) / 255 * 100) / 100 : 1 }
  }
  const nums = (text: string) => text.split(/[\s,/]+/).filter(Boolean)
  m = s.match(/^rgba?\((.+)\)$/) ?? s.match(/^(\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*[\d.]+)?)$/)
  if (m) {
    const [r, g, b, a] = nums(m[1]!)
    if (r === undefined || g === undefined || b === undefined) return undefined
    const channel = (v: string) => v.endsWith('%') ? Number.parseFloat(v) * 2.55 : Number.parseFloat(v)
    const alpha = a === undefined ? 1 : a.endsWith('%') ? Number.parseFloat(a) / 100 : Number.parseFloat(a)
    const out = { r: Math.round(channel(r)), g: Math.round(channel(g)), b: Math.round(channel(b)), a: alpha }
    return [out.r, out.g, out.b].every(v => v >= 0 && v <= 255) && alpha >= 0 && alpha <= 1 ? out : undefined
  }
  m = s.match(/^hsla?\((.+)\)$/)
  if (m) {
    const [h, sat, l, a] = nums(m[1]!)
    if (h === undefined || sat === undefined || l === undefined) return undefined
    const rgb = hslToRgb(Number.parseFloat(h), Number.parseFloat(sat), Number.parseFloat(l))
    const alpha = a === undefined ? 1 : a.endsWith('%') ? Number.parseFloat(a) / 100 : Number.parseFloat(a)
    return { ...rgb, a: alpha }
  }
  return undefined
}

export function toHex({ r, g, b, a }: RGBA): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ''}`
}

export function rgbToHsl({ r, g, b }: Pick<RGBA, 'r' | 'g' | 'b'>) {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255]
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0)
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb(h: number, s: number, l: number) {
  const sn = clamp(s, 0, 100) / 100
  const ln = clamp(l, 0, 100) / 100
  const k = (n: number) => (n + ((h % 360) + 360) % 360 / 30) % 12
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) }
}

/** CMYK ingenuo (sin perfil de color): sirve de referencia, no para imprenta. */
export function rgbToCmyk({ r, g, b }: Pick<RGBA, 'r' | 'g' | 'b'>) {
  const k = 1 - Math.max(r, g, b) / 255
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 }
  const f = (v: number) => Math.round((1 - v / 255 - k) / (1 - k) * 100)
  return { c: f(r), m: f(g), y: f(b), k: Math.round(k * 100) }
}

/** Luminancia relativa (WCAG 2). */
export function luminance({ r, g, b }: Pick<RGBA, 'r' | 'g' | 'b'>): number {
  const ch = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

export function contrastRatio(a: Pick<RGBA, 'r' | 'g' | 'b'>, b: Pick<RGBA, 'r' | 'g' | 'b'>): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1! + 0.05) / (l2! + 0.05)
}

/** Nivel WCAG para texto normal y texto grande (≥ 24 px, o ≥ 18,66 px en negrita). */
export function wcag(ratio: number) {
  return {
    normal: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'No pasa',
    large: ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'No pasa',
  } as const
}

// --- Unidades CSS ---------------------------------------------------------------------------
// En CSS, 1 in = 96 px y 1 pt = 1/72 in, sin importar la pantalla.

export const CSS_UNITS = ['px', 'rem', 'em', 'pt', '%', 'mm', 'cm', 'in'] as const
export type CssUnit = typeof CSS_UNITS[number]

export function cssToPx(value: number, unit: CssUnit, base = 16): number {
  switch (unit) {
    case 'px': return value
    case 'rem':
    case 'em': return value * base
    case '%': return value / 100 * base
    case 'pt': return value * 96 / 72
    case 'in': return value * 96
    case 'cm': return value * 96 / 2.54
    case 'mm': return value * 96 / 25.4
  }
}

export function convertCss(value: number, from: CssUnit, to: CssUnit, base = 16): number {
  const px = cssToPx(value, from, base)
  return px / cssToPx(1, to, base)
}

// --- Pantallas ------------------------------------------------------------------------------

/** Densidad de una pantalla: píxeles por pulgada, tamaño físico y paso de píxel. */
export function screenDensity(widthPx: number, heightPx: number, diagonalIn: number) {
  const diagonalPx = Math.hypot(widthPx, heightPx)
  const ppi = diagonalPx / diagonalIn
  return {
    ppi,
    dotPitchMm: 25.4 / ppi,
    widthCm: widthPx / ppi * 2.54,
    heightCm: heightPx / ppi * 2.54,
    megapixels: widthPx * heightPx / 1e6,
    aspect: aspectRatio(widthPx, heightPx),
  }
}

export function aspectRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a
  const g = gcd(Math.round(w), Math.round(h)) || 1
  const [rw, rh] = [Math.round(w) / g, Math.round(h) / g]
  // 1366×768 da 683:384: se muestra el aproximado conocido.
  const known: Array<[number, string]> = [[16 / 9, '16:9'], [16 / 10, '16:10'], [4 / 3, '4:3'], [21 / 9, '21:9'], [3 / 2, '3:2'], [1, '1:1'], [19.5 / 9, '19,5:9'], [20 / 9, '20:9']]
  const ratio = w / h
  const near = known.find(([r]) => Math.abs(r - ratio) / r < 0.01)
  const exact = `${rw}:${rh}`
  return near && near[1].replace(',', '.') !== exact ? `${exact} (≈ ${near[1]})` : exact
}
