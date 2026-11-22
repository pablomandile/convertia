// Series de tiempo para los gráficos: [["2026-01-31", 1234.5], …] ordenadas por fecha.

export type Series = Array<[string, number]>

/** Fuentes de historia, todas expresadas como "unidades de la moneda por 1 USD" o como precio en USD. */
export interface HistorySources {
  /** ARS por USD (dólar oficial, venta). */
  ars?: Series
  /** Unidades de cada moneda por 1 USD (EUR, BRL…). */
  fiat?: Record<string, Series>
  /** Precio en USD de una unidad (BTC, ETH, XAU, XAG…). */
  usdPrice?: Record<string, Series>
}

/** "Unidades de `code` por 1 USD" a lo largo del tiempo, o 'usd' si es el propio dólar. */
function perUsd(code: string, src: HistorySources): Series | 'usd' | undefined {
  if (code === 'USD') return 'usd'
  if (code === 'ARS') return src.ars
  if (src.fiat?.[code]) return src.fiat[code]
  const price = src.usdPrice?.[code]
  return price?.map(([d, v]) => [d, 1 / v] as [string, number])
}

/**
 * Cuántas unidades de `to` vale 1 `from`, día por día: (to por USD) / (from por USD).
 * Usa solo las fechas que tienen las dos series. undefined si falta alguna.
 */
export function pairSeries(from: string, to: string, src: HistorySources): Series | undefined {
  if (from === to) return undefined
  // Precio en USD de algo → USD: la serie original (sin invertir dos veces y perder precisión).
  if (to === 'USD' && src.usdPrice?.[from]) return src.usdPrice[from]!.slice()
  const a = perUsd(from, src)
  const b = perUsd(to, src)
  if (!a || !b) return undefined
  if (a === 'usd' && b === 'usd') return undefined
  if (a === 'usd') return (b as Series).slice()
  if (b === 'usd') return (a as Series).map(([d, v]) => [d, 1 / v] as [string, number])
  const fromByDate = new Map(a)
  return (b as Series).filter(([d]) => fromByDate.has(d)).map(([d, v]) => [d, v / fromByDate.get(d)!] as [string, number])
}

/** Los últimos `days` días de la serie (contando desde su último dato). */
export function lastDays(series: Series, days: number): Series {
  if (!series.length) return series
  const end = Date.parse(series.at(-1)![0])
  const start = end - days * 86400000
  return series.filter(([d]) => Date.parse(d) >= start)
}

export function seriesStats(series: Series) {
  if (!series.length) return undefined
  const values = series.map(([, v]) => v)
  const first = values[0]!
  const last = values.at(-1)!
  return {
    first,
    last,
    min: Math.min(...values),
    max: Math.max(...values),
    changePct: (last / first - 1) * 100,
    from: series[0]![0],
    to: series.at(-1)![0],
  }
}

/** Un valor por mes (el último de cada mes), para la vista en tabla. */
export function monthlyLast(series: Series): Series {
  const byMonth = new Map<string, [string, number]>()
  for (const point of series) byMonth.set(point[0].slice(0, 7), point)
  return [...byMonth.values()]
}

/** Marcas "lindas" para un eje: 0 / 500 / 1.000 / 1.500… entre min y max. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!(max > min)) return [min]
  const span = max - min
  const raw = span / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => span / s <= count) ?? 10 * mag
  const start = Math.ceil(min / step) * step
  const ticks: number[] = []
  for (let t = start; t <= max + step * 1e-9; t += step) ticks.push(Number(t.toPrecision(12)))
  return ticks
}
