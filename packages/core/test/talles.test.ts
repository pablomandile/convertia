import { describe, expect, it } from 'vitest'
import { PAPER_SIZES, paperPixels, ringFromCircumference, ringFromDiameter, ringFromUS, SHOE_SYSTEMS, shoeSizes } from '../src'

describe('calzado', () => {
  it('equivalencias habituales a partir del largo del pie', () => {
    // 26 cm: suele figurar como AR 40, EU 41, US 8 hombre / 9,5 mujer, UK 7.
    expect(shoeSizes('cm', 26)).toMatchObject({ eu: 41, ar: 40, usm: 8.5, uk: 7.5 })
    expect(shoeSizes('ar', 40).cm).toBeCloseTo(26, 0)
  })

  it('ida y vuelta entre sistemas (a medio número)', () => {
    for (const sys of SHOE_SYSTEMS) {
      const all = shoeSizes('cm', 25)
      const back = shoeSizes(sys.id, all[sys.id])
      expect(Math.abs(back.eu - all.eu)).toBeLessThanOrEqual(1)
    }
  })
})

describe('anillos', () => {
  it('talle EE. UU. 7 ≈ 17,3 mm de diámetro y 54,4 mm de circunferencia', () => {
    expect(ringFromUS(7)).toEqual({ diameter: 17.3, circumference: 54.4, us: 7 })
    expect(ringFromDiameter(17.3).us).toBe(7)
    expect(ringFromCircumference(54.4).us).toBe(7)
  })
})

describe('papel', () => {
  it('A4 a 300 ppp', () => {
    const a4 = PAPER_SIZES.find(p => p.id === 'A4')!
    expect([a4.w, a4.h]).toEqual([210, 297])
    expect(paperPixels(a4, 300)).toEqual({ w: 2480, h: 3508 })
  })

  it('serie A: cada tamaño es la mitad del anterior', () => {
    const a = PAPER_SIZES.filter(p => p.group === 'ISO A')
    for (let i = 1; i < a.length; i++) {
      expect(a[i]!.h).toBe(a[i - 1]!.w)
    }
  })
})
