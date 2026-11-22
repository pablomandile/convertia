import { describe, expect, it } from 'vitest'
import { amountToWords, formatInBase, fromRoman, groupDigits, integerToWords, parseInBase, toRoman } from '../src'

describe('romanos', () => {
  it.each([
    [1, 'I'], [4, 'IV'], [9, 'IX'], [14, 'XIV'], [40, 'XL'], [90, 'XC'], [400, 'CD'],
    [1994, 'MCMXCIV'], [2026, 'MMXXVI'], [3999, 'MMMCMXCIX'],
  ])('%d ↔ %s', (n, r) => {
    expect(toRoman(n)).toBe(r)
    expect(fromRoman(r)).toBe(n)
    expect(fromRoman(r.toLowerCase())).toBe(n)
  })

  it('ida y vuelta de 1 a 3999', () => {
    for (let n = 1; n <= 3999; n++) expect(fromRoman(toRoman(n))).toBe(n)
  })

  it('rechaza lo inválido', () => {
    expect(() => toRoman(0)).toThrow()
    expect(() => toRoman(4000)).toThrow()
    expect(() => toRoman(1.5)).toThrow()
    for (const bad of ['IIII', 'VX', 'IC', 'MMMM', 'ABC', '']) expect(() => fromRoman(bad)).toThrow()
  })
})

describe('bases', () => {
  it('convierte entre bases', () => {
    expect(parseInBase('ff', 16)).toBe(255n)
    expect(parseInBase('0xFF', 16)).toBe(255n)
    expect(parseInBase('1111 1111', 2)).toBe(255n)
    expect(parseInBase('0b1010', 2)).toBe(10n)
    expect(parseInBase('777', 8)).toBe(511n)
    expect(parseInBase('-10', 10)).toBe(-10n)
    expect(formatInBase(255n, 2)).toBe('11111111')
    expect(formatInBase(255n, 16)).toBe('FF')
    expect(formatInBase(35n, 36)).toBe('Z')
  })

  it('maneja números enormes sin perder precisión', () => {
    const big = parseInBase('123456789012345678901234567890', 10)
    expect(formatInBase(parseInBase(formatInBase(big, 16), 16), 10)).toBe('123456789012345678901234567890')
  })

  it('rechaza dígitos fuera de la base', () => {
    expect(() => parseInBase('102', 2)).toThrow(/no es un dígito válido en base 2/)
    expect(() => parseInBase('g', 16)).toThrow()
    expect(() => parseInBase('', 10)).toThrow()
  })

  it('agrupa dígitos', () => {
    expect(groupDigits('11111111', 4)).toBe('1111 1111')
    expect(groupDigits('1010', 4)).toBe('1010')
    expect(groupDigits('101', 4)).toBe('101')
    expect(groupDigits('1234567', 3, '.')).toBe('1.234.567')
  })
})

describe('número a letras', () => {
  it.each([
    [0, 'cero'],
    [1, 'uno'],
    [15, 'quince'],
    [16, 'dieciséis'],
    [21, 'veintiuno'],
    [22, 'veintidós'],
    [30, 'treinta'],
    [31, 'treinta y uno'],
    [99, 'noventa y nueve'],
    [100, 'cien'],
    [101, 'ciento uno'],
    [115, 'ciento quince'],
    [500, 'quinientos'],
    [999, 'novecientos noventa y nueve'],
    [1000, 'mil'],
    [1001, 'mil uno'],
    [2000, 'dos mil'],
    [21000, 'veintiún mil'],
    [31000, 'treinta y un mil'],
    [100000, 'cien mil'],
    [101000, 'ciento un mil'],
    [1000000, 'un millón'],
    [2000000, 'dos millones'],
    [21000000, 'veintiún millones'],
    [1000000000, 'mil millones'],
    [1234567, 'un millón doscientos treinta y cuatro mil quinientos sesenta y siete'],
    [1000000000000, 'un billón'],
  ])('%d → %s', (n, words) => {
    expect(integerToWords(n)).toBe(words)
  })

  it('apócope delante de un sustantivo', () => {
    expect(integerToWords(21, { apocopar: true })).toBe('veintiún')
    expect(integerToWords(1, { apocopar: true })).toBe('un')
    expect(integerToWords(41, { apocopar: true })).toBe('cuarenta y un')
  })

  it('montos para cheques', () => {
    expect(amountToWords('1234.50')).toBe('Mil doscientos treinta y cuatro pesos con 50/100')
    expect(amountToWords('1')).toBe('Un peso con 00/100')
    expect(amountToWords('21')).toBe('Veintiún pesos con 00/100')
    expect(amountToWords('1000000')).toBe('Un millón de pesos con 00/100')
    expect(amountToWords('1000200')).toBe('Un millón doscientos pesos con 00/100')
    expect(amountToWords('10.5', undefined, 'centavos')).toBe('Diez pesos con cincuenta centavos')
    expect(amountToWords('3.01', { singular: 'dólar', plural: 'dólares' }, 'centavos')).toBe('Tres dólares con un centavo')
  })
})
