import { describe, expect, it } from 'vitest'
import { categories, convert, getCategory, pairSlug, parsePairSlug, round, unitSlug } from '../src'

const c = (v: number | string, cat: string, from: string, to: string, digits = 10) => round(convert(v, cat, from, to), digits)

describe('valores de referencia', () => {
  it('masa', () => {
    expect(c(1, 'masa', 'lb', 'kg')).toBe(0.45359237)
    expect(c(1, 'masa', 'kg', 'lb')).toBe(2.204622622)
    expect(c(16, 'masa', 'oz', 'lb')).toBe(1)
    expect(c(1, 'masa', 'st', 'lb')).toBe(14)
  })
  it('volumen', () => {
    expect(c(1, 'volumen', 'gal', 'l')).toBe(3.785411784)
    expect(c(1, 'volumen', 'gal', 'cup')).toBe(16)
    expect(c(1, 'volumen', 'tbsp', 'tsp')).toBe(3)
    expect(c(1, 'volumen', 'galuk', 'ptuk')).toBe(8)
  })
  it('área', () => {
    expect(c(1, 'area', 'ha', 'm2')).toBe(10000)
    expect(c(1, 'area', 'ac', 'ft2')).toBe(43560)
    expect(c(1, 'area', 'mi2', 'ac')).toBe(640)
  })
  it('velocidad', () => {
    expect(c(36, 'velocidad', 'kmh', 'mps')).toBe(10)
    expect(c(1, 'velocidad', 'kn', 'kmh')).toBe(1.852)
    expect(c(60, 'velocidad', 'mph', 'kmh')).toBe(96.56064)
  })
  it('tiempo y datos', () => {
    expect(c(1, 'tiempo', 'd', 'h')).toBe(24)
    expect(c(1, 'tiempo', 'yr', 'd')).toBe(365.2425)
    expect(c(1, 'datos', 'GiB', 'MiB')).toBe(1024)
    expect(c(1, 'datos', 'GB', 'MB')).toBe(1000)
    expect(c(100, 'datos', 'Mbit', 'MB')).toBe(12.5)
  })
  it('consumo de combustible (inversa)', () => {
    expect(c(1, 'fuel', 'mpg', 'l100km', 9)).toBe(235.214583)
    expect(c(10, 'fuel', 'kml', 'l100km')).toBe(10)
    expect(c(5, 'fuel', 'l100km', 'kml')).toBe(20)
  })
  it('energía, potencia, presión', () => {
    expect(c(1, 'energia', 'kcal', 'kJ')).toBe(4.184)
    expect(c(1, 'energia', 'kWh', 'MJ')).toBe(3.6)
    expect(c(1, 'potencia', 'hp', 'W', 9)).toBe(745.699872)
    expect(c(3000, 'potencia', 'frig', 'W')).toBe(3489)
    expect(c(1, 'potencia', 'TR', 'BTUh')).toBe(12000)
    expect(c(1, 'presion', 'atm', 'Pa')).toBe(101325)
    expect(c(1, 'presion', 'psi', 'kPa', 9)).toBe(6.89475729)
    expect(c(760, 'presion', 'torr', 'atm')).toBe(1)
  })
  it('ángulo, frecuencia, densidad', () => {
    expect(c(180, 'angulo', 'deg', 'rad', 15)).toBe(3.14159265358979)
    expect(c(1, 'angulo', 'turn', 'grad')).toBe(400)
    expect(c(60, 'frecuencia', 'rpm', 'Hz')).toBe(1)
    expect(c(1, 'densidad', 'gcm3', 'kgm3')).toBe(1000)
  })
})

describe('slugs para las URLs', () => {
  for (const category of categories) {
    it(`${category.slug}: slugs únicos, sin "-a-" y reversibles`, () => {
      const slugs = category.units.map(unitSlug)
      expect(new Set(slugs).size).toBe(slugs.length)
      for (const s of slugs) expect(s).not.toContain('-a-')
      const [a, b] = category.units
      expect(parsePairSlug(category, pairSlug(a!, b!))).toEqual({ from: a, to: b })
    })
  }

  it('genera nombres legibles', () => {
    const longitud = getCategory('longitud')!
    expect(pairSlug(longitud.units.find(u => u.id === 'ft')!, longitud.units.find(u => u.id === 'm')!)).toBe('pies-a-metros')
    const temp = getCategory('temperatura')!
    expect(unitSlug(temp.units.find(u => u.id === 'C')!)).toBe('grados-celsius')
  })

  it('los slugs de categoría son únicos', () => {
    const slugs = categories.map(c => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
