import { describe, expect, it } from 'vitest'
import { businessDaysBetween, lastDays, monthlyLast, niceTicks, pairSeries, parseISODate, seriesStats } from '../src'
import type { HistorySources } from '../src'

const src: HistorySources = {
  ars: [['2026-01-01', 1000], ['2026-01-02', 1100]],
  fiat: { EUR: [['2026-01-01', 0.9], ['2026-01-02', 0.8]] },
  usdPrice: { BTC: [['2026-01-01', 50000], ['2026-01-02', 55000]] },
}

describe('pairSeries', () => {
  it('USD contra otra: la serie tal cual', () => {
    expect(pairSeries('USD', 'ARS', src)).toEqual(src.ars)
  })
  it('otra contra USD: invertida', () => {
    expect(pairSeries('ARS', 'USD', src)![0]![1]).toBeCloseTo(0.001, 10)
    expect(pairSeries('BTC', 'USD', src)).toEqual(src.usdPrice!.BTC)
  })
  it('cruzadas pasan por el USD', () => {
    // 1 EUR = 1000 / 0,9 ARS
    expect(pairSeries('EUR', 'ARS', src)![0]![1]).toBeCloseTo(1111.111, 2)
    // 1 BTC = 50000 × 1000 ARS
    expect(pairSeries('BTC', 'ARS', src)![1]![1]).toBeCloseTo(55000 * 1100, 4)
  })
  it('sin historia, undefined', () => {
    expect(pairSeries('CLP', 'USD', src)).toBeUndefined()
    expect(pairSeries('USD', 'USD', src)).toBeUndefined()
  })
})

describe('utilidades de series', () => {
  const s: Array<[string, number]> = [['2026-01-01', 10], ['2026-01-15', 20], ['2026-02-10', 15], ['2026-03-01', 30]]
  it('recorta, resume y agrupa por mes', () => {
    expect(lastDays(s, 30).map(([d]) => d)).toEqual(['2026-02-10', '2026-03-01'])
    expect(seriesStats(s)).toMatchObject({ first: 10, last: 30, min: 10, max: 30, changePct: 200 })
    expect(monthlyLast(s).map(([d]) => d)).toEqual(['2026-01-15', '2026-02-10', '2026-03-01'])
  })
  it('marcas lindas para el eje', () => {
    expect(niceTicks(0, 1000)).toEqual([0, 250, 500, 750, 1000])
    expect(niceTicks(1430, 1810)).toEqual([1500, 1600, 1700, 1800])
    expect(niceTicks(0.8, 0.95)).toEqual([0.8, 0.85, 0.9, 0.95])
  })
})

describe('días hábiles con feriados', () => {
  it('descuenta los feriados que caen de lunes a viernes', () => {
    const d = (x: string) => parseISODate(x)!
    // Semana del lunes 2026-11-16: 5 hábiles; con feriado el lunes 23 no cambia (fuera del rango).
    expect(businessDaysBetween(d('2026-11-16'), d('2026-11-23'), new Set(['2026-11-20']))).toBe(4)
    expect(businessDaysBetween(d('2026-11-16'), d('2026-11-23'), new Set(['2026-11-22']))).toBe(5) // domingo
  })
})
