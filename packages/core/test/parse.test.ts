import { describe, expect, it } from 'vitest'
import { convertCurrency, currencyName, parseNumber, parseQuery, round } from '../src'

describe('parseNumber (convención argentina)', () => {
  it.each([
    ['1', 1],
    ['1,5', 1.5],
    ['1.5', 1.5],
    ['0.25', 0.25],
    ['0,25', 0.25],
    ['1.500', 1500],
    ['1.500.000', 1500000],
    ['1.500,25', 1500.25],
    ['1,500.25', 1500.25],
    ['-40', -40],
    ['1e3', 1000],
    [',5', 0.5],
  ])('%s → %d', (raw, expected) => {
    expect(Number(parseNumber(raw)!.toString())).toBe(expected)
  })

  it('rechaza lo que no es número', () => {
    expect(parseNumber('abc')).toBeUndefined()
    expect(parseNumber('')).toBeUndefined()
    expect(parseNumber('1-2')).toBeUndefined()
  })
})

describe('parseQuery: unidades', () => {
  it('interpreta origen y destino', () => {
    const r = parseQuery('10 km a mi')
    expect(r?.kind).toBe('unit')
    if (r?.kind !== 'unit') return
    expect(r.category.id).toBe('length')
    expect(r.from.id).toBe('km')
    expect(r.to?.id).toBe('mi')
  })

  it.each([
    ['10km en millas', 'length', 'km', 'mi'],
    ['72 f a c', 'temperature', 'F', 'C'],
    ['100 gr a oz', 'mass', 'g', 'oz'],
    ['2 tazas a ml', 'volume', 'cup', 'ml'],
    ['8 l/100km a mpg', 'fuel', 'l100km', 'mpg'],
    ['1 GiB to MB', 'data', 'GiB', 'MB'],
    ['30 grados a rad', 'angle', 'deg', 'rad'],
    ['30 grados a f', 'temperature', 'C', 'F'],
    ['3000 frigorias a btu/h', 'power', 'frig', 'BTUh'],
    ['10 in a cm', 'length', 'in', 'cm'],
    ['10 kilómetros → metros', 'length', 'km', 'm'],
    ['1 metro cuadrado en pies cuadrados', 'area', 'm2', 'ft2'],
  ])('"%s"', (q, category, from, to) => {
    const r = parseQuery(q)
    expect(r?.kind).toBe('unit')
    if (r?.kind !== 'unit') return
    expect([r.category.id, r.from.id, r.to?.id]).toEqual([category, from, to])
  })

  it('suma valores compuestos: 5 ft 10 in', () => {
    const r = parseQuery('5 ft 10 in en cm')
    expect(r?.kind).toBe('unit')
    if (r?.kind !== 'unit') return
    expect(r.from.id).toBe('ft')
    expect(r.to?.id).toBe('cm')
    expect(round(r.value)).toBe(5.833333333)
  })

  it('sin destino devuelve solo el origen', () => {
    const r = parseQuery('10 km')
    expect(r?.kind).toBe('unit')
    if (r?.kind !== 'unit') return
    expect(r.to).toBeUndefined()
  })

  it('devuelve undefined si no entiende', () => {
    expect(parseQuery('hola mundo')).toBeUndefined()
    expect(parseQuery('10 km a kg')).toBeUndefined()
    expect(parseQuery('')).toBeUndefined()
  })
})

describe('parseQuery: monedas', () => {
  const rates = { USD: 1, ARS: 1000, EUR: 0.9, BRL: 5 }

  it.each([
    ['100 usd a ars', 'USD', 'ARS'],
    ['50 euros en pesos', 'EUR', 'ARS'],
    ['1.000 pesos a dolares', 'ARS', 'USD'],
    ['20 reales a usd', 'BRL', 'USD'],
  ])('"%s"', (q, from, to) => {
    const r = parseQuery(q, { rates })
    expect(r).toMatchObject({ kind: 'currency', from, to })
  })

  it('con cotizaciones, ignora códigos desconocidos', () => {
    expect(parseQuery('10 xyz a usd', { rates })).toBeUndefined()
  })

  it('convierte vía USD', () => {
    expect(round(convertCurrency(100, 'USD', 'ARS', rates))).toBe(100000)
    expect(round(convertCurrency(90, 'EUR', 'BRL', rates))).toBe(500)
    expect(() => convertCurrency(1, 'USD', 'XYZ', rates)).toThrow(/Sin cotización/)
  })

  it('nombra las monedas en español', () => {
    expect(currencyName('EUR')).toBe('Euro')
    expect(currencyName('BTC')).toBe('Bitcoin')
  })
})
