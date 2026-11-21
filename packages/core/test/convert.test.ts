import { describe, expect, it } from 'vitest'
import Decimal from 'decimal.js-light'
import { categories, convert, convertToAll, getCategory, round } from '../src'

describe('longitud', () => {
  it('usa las definiciones exactas', () => {
    expect(convert(1, 'longitud', 'in', 'cm').toString()).toBe('2.54')
    expect(convert(1, 'longitud', 'ft', 'm').toString()).toBe('0.3048')
    expect(convert(1, 'longitud', 'mi', 'km').toString()).toBe('1.609344')
    expect(convert(1, 'longitud', 'yd', 'in').toString()).toBe('36')
  })

  it('evita los errores de coma flotante de JS', () => {
    // 0.1 + 0.2 en JS da 0.30000000000000004
    expect(convert('0.3', 'longitud', 'm', 'cm').toString()).toBe('30')
  })

  it('convierte a todas las unidades', () => {
    const all = convertToAll(1, 'length', 'km')
    expect(all.find(r => r.unit.id === 'm')?.value.toString()).toBe('1000')
    expect(all).toHaveLength(getCategory('length')!.units.length)
  })
})

describe('temperatura', () => {
  it('maneja conversiones afines', () => {
    expect(round(convert(0, 'temperatura', 'C', 'F'))).toBe(32)
    expect(round(convert(100, 'temperatura', 'C', 'F'))).toBe(212)
    expect(round(convert(-40, 'temperatura', 'F', 'C'))).toBe(-40)
    expect(round(convert(0, 'temperatura', 'C', 'K'))).toBe(273.15)
    expect(round(convert(0, 'temperatura', 'K', 'R'))).toBe(0)
    expect(round(convert(32, 'temperatura', 'F', 'R'))).toBe(491.67)
  })
})

describe('todas las categorías', () => {
  for (const category of categories) {
    it(`${category.slug}: la unidad base existe y los ids no se repiten`, () => {
      const ids = category.units.map(u => u.id)
      expect(ids).toContain(category.baseUnit)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it(`${category.slug}: A → B → A vuelve al valor original`, () => {
      const value = new Decimal('123.456')
      for (const a of category.units) {
        for (const b of category.units) {
          const back = convert(convert(value, category.id, a.id, b.id), category.id, b.id, a.id)
          expect(round(back, 12)).toBe(123.456)
        }
      }
    })

    it(`${category.slug}: los pares populares son válidos`, () => {
      for (const [from, to] of category.popular ?? []) {
        expect(() => convert(1, category.id, from, to)).not.toThrow()
      }
    })
  }
})

describe('errores', () => {
  it('avisa si la categoría o la unidad no existe', () => {
    expect(() => convert(1, 'nada', 'm', 'km')).toThrow(/Categoría desconocida/)
    expect(() => convert(1, 'longitud', 'm', 'parsec')).toThrow(/Unidad desconocida/)
  })
})
