import { describe, expect, it } from 'vitest'
import { aspectRatio, contrastRatio, convertCss, hslToRgb, parseColor, rgbToCmyk, rgbToHsl, screenDensity, toHex, wcag } from '../src'

describe('colores', () => {
  it('lee formatos', () => {
    expect(parseColor('#0f766e')).toEqual({ r: 15, g: 118, b: 110, a: 1 })
    expect(parseColor('0F766E')).toEqual({ r: 15, g: 118, b: 110, a: 1 })
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#00000080')).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(parseColor('rgb(15, 118, 110)')).toEqual({ r: 15, g: 118, b: 110, a: 1 })
    expect(parseColor('rgb(15 118 110 / 50%)')).toEqual({ r: 15, g: 118, b: 110, a: 0.5 })
    expect(parseColor('15,118,110')).toEqual({ r: 15, g: 118, b: 110, a: 1 })
    expect(parseColor('hsl(0 100% 50%)')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(parseColor('rgb(300, 0, 0)')).toBeUndefined()
    expect(parseColor('nada')).toBeUndefined()
  })

  it('convierte', () => {
    expect(toHex({ r: 15, g: 118, b: 110, a: 1 })).toBe('#0f766e')
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 })
    expect(rgbToHsl({ r: 15, g: 118, b: 110 })).toEqual({ h: 175, s: 77, l: 26 })
    expect(hslToRgb(120, 100, 25)).toEqual({ r: 0, g: 128, b: 0 })
    expect(rgbToCmyk({ r: 255, g: 0, b: 0 })).toEqual({ c: 0, m: 100, y: 100, k: 0 })
    expect(rgbToCmyk({ r: 0, g: 0, b: 0 })).toEqual({ c: 0, m: 0, y: 0, k: 100 })
  })

  it('HSL ida y vuelta en una grilla de colores', () => {
    for (let r = 0; r <= 255; r += 51) {
      for (let g = 0; g <= 255; g += 51) {
        for (let b = 0; b <= 255; b += 51) {
          const { h, s, l } = rgbToHsl({ r, g, b })
          const back = hslToRgb(h, s, l)
          expect(Math.abs(back.r - r) + Math.abs(back.g - g) + Math.abs(back.b - b)).toBeLessThanOrEqual(9)
        }
      }
    }
  })

  it('contraste WCAG', () => {
    expect(contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(21, 6)
    expect(contrastRatio({ r: 118, g: 118, b: 118 }, { r: 255, g: 255, b: 255 })).toBeCloseTo(4.54, 2)
    expect(wcag(4.54)).toEqual({ normal: 'AA', large: 'AAA' })
    expect(wcag(3.2)).toEqual({ normal: 'No pasa', large: 'AA' })
  })
})

describe('unidades CSS', () => {
  it('px, rem, pt, cm', () => {
    expect(convertCss(16, 'px', 'rem')).toBe(1)
    expect(convertCss(1.5, 'rem', 'px')).toBe(24)
    expect(convertCss(12, 'pt', 'px')).toBe(16)
    expect(convertCss(1, 'in', 'cm')).toBeCloseTo(2.54, 10)
    expect(convertCss(20, 'px', 'rem', 10)).toBe(2)
    expect(convertCss(150, '%', 'px')).toBe(24)
  })
})

describe('pantallas', () => {
  it('PPI y proporción', () => {
    expect(screenDensity(1920, 1080, 24).ppi).toBeCloseTo(91.79, 2)
    expect(screenDensity(2560, 1440, 27).ppi).toBeCloseTo(108.79, 2)
    expect(aspectRatio(1920, 1080)).toBe('16:9')
    expect(aspectRatio(1366, 768)).toBe('683:384 (≈ 16:9)')
    expect(aspectRatio(1920, 1200)).toBe('8:5 (≈ 16:10)')
  })
})
