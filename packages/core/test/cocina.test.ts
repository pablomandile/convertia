import { describe, expect, it } from 'vitest'
import { convertIngredient, formatQuantity, INGREDIENTS, KITCHEN_MEASURES, oven, parseQuantity, scaleRecipe } from '../src'

describe('ingredientes', () => {
  it('volumen ↔ peso según la densidad', () => {
    expect(convertIngredient(1, 'taza', 'g', 'agua')).toBeCloseTo(250, 6)
    expect(convertIngredient(1, 'taza', 'g', 'harina')).toBeCloseTo(132.5, 6)
    expect(convertIngredient(1, 'taza-us', 'g', 'azucar')).toBeCloseTo(198.7, 1)
    expect(convertIngredient(1, 'cda', 'g', 'manteca')).toBeCloseTo(14.4, 6)
    expect(convertIngredient(250, 'g', 'taza', 'agua')).toBeCloseTo(1, 10)
  })

  it('volumen ↔ volumen y peso ↔ peso no dependen del ingrediente', () => {
    expect(convertIngredient(1, 'cda', 'cdita', 'harina')).toBeCloseTo(3, 10)
    expect(convertIngredient(1, 'lb', 'g', 'harina')).toBeCloseTo(453.59237, 8)
  })

  it('ida y vuelta para todos los ingredientes y medidas', () => {
    for (const i of INGREDIENTS) {
      for (const a of KITCHEN_MEASURES) {
        for (const b of KITCHEN_MEASURES) {
          expect(convertIngredient(convertIngredient(2, a.id, b.id, i.id), b.id, a.id, i.id)).toBeCloseTo(2, 9)
        }
      }
    }
  })
})

describe('horno', () => {
  it('convierte y describe', () => {
    expect(oven(180)).toMatchObject({ fahrenheit: 356, gas: 4, fan: 160, label: 'Moderado' })
    expect(oven(220)).toMatchObject({ gas: 7, label: 'Fuerte' })
    expect(oven(100).gas).toBeUndefined()
  })
})

describe('escalar recetas', () => {
  it('lee cantidades', () => {
    expect(parseQuantity('1 1/2')).toBe(1.5)
    expect(parseQuantity('1½')).toBe(1.5)
    expect(parseQuantity('½')).toBe(0.5)
    expect(parseQuantity('3/4')).toBe(0.75)
    expect(parseQuantity('1,5')).toBe(1.5)
    expect(parseQuantity('abc')).toBeUndefined()
  })

  it('escribe cantidades legibles', () => {
    expect(formatQuantity(1.5)).toBe('1 ½')
    expect(formatQuantity(0.5)).toBe('½')
    expect(formatQuantity(1 / 3)).toBe('⅓')
    expect(formatQuantity(3)).toBe('3')
    expect(formatQuantity(2.4)).toBe('2,4')
    expect(formatQuantity(375)).toBe('375')
    expect(formatQuantity(12.25)).toBe('12,3')
  })

  it('escala la primera cantidad de cada línea y deja el horno', () => {
    const recipe = '250 g de harina\n2 huevos\n1/2 taza de leche\nHorno a 180 °C por 40 minutos\nUna pizca de sal'
    expect(scaleRecipe(recipe, 1.5)).toBe('375 g de harina\n3 huevos\n¾ taza de leche\nHorno a 180 °C por 40 minutos\nUna pizca de sal')
    expect(scaleRecipe('1 1/2 taza de azúcar', 2)).toBe('3 taza de azúcar')
    expect(scaleRecipe('Harina: 500 g', 0.5)).toBe('Harina: 250 g')
  })
})
