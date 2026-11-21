import type { CategoryDef } from '../types'

// Base: kilogramo. 1 lb = 0,45359237 kg exacto (1959).
export const masa: CategoryDef = {
  id: 'mass',
  slug: 'masa',
  name: { es: 'Masa y peso', en: 'Mass' },
  baseUnit: 'kg',
  popular: [['lb', 'kg'], ['kg', 'lb'], ['oz', 'g'], ['g', 'oz'], ['st', 'kg']],
  units: [
    { id: 'mg', symbol: 'mg', name: { es: 'Miligramo', en: 'Milligram' }, factor: '0.000001', system: 'si', aliases: ['miligramo', 'miligramos'] },
    { id: 'g', symbol: 'g', name: { es: 'Gramo', en: 'Gram' }, factor: '0.001', system: 'si', aliases: ['gramo', 'gramos', 'gr', 'grs'] },
    { id: 'kg', symbol: 'kg', name: { es: 'Kilogramo', en: 'Kilogram' }, factor: '1', system: 'si', aliases: ['kilo', 'kilos', 'kilogramo', 'kilogramos', 'kgs'] },
    { id: 't', symbol: 't', name: { es: 'Tonelada', en: 'Tonne' }, factor: '1000', system: 'si', aliases: ['tonelada', 'toneladas', 'tn'] },
    { id: 'ct', symbol: 'ct', name: { es: 'Quilate', en: 'Carat' }, factor: '0.0002', system: 'otro', aliases: ['quilate', 'quilates', 'carat', 'carats'] },
    { id: 'grain', symbol: 'gn', name: { es: 'Grano', en: 'Grain' }, factor: '0.00006479891', system: 'imperial', aliases: ['grano', 'granos', 'grain', 'grains'] },
    { id: 'oz', symbol: 'oz', name: { es: 'Onza', en: 'Ounce' }, factor: '0.028349523125', system: 'imperial', aliases: ['onza', 'onzas', 'ounce', 'ounces'] },
    { id: 'ozt', symbol: 'oz t', name: { es: 'Onza troy', en: 'Troy ounce' }, plural: 'Onzas troy', factor: '0.0311034768', system: 'otro', aliases: ['onza troy', 'onzas troy', 'troy'] },
    { id: 'lb', symbol: 'lb', name: { es: 'Libra', en: 'Pound' }, factor: '0.45359237', system: 'imperial', aliases: ['libra', 'libras', 'lbs', 'pound', 'pounds'] },
    { id: 'st', symbol: 'st', name: { es: 'Stone', en: 'Stone' }, plural: 'Stones', factor: '6.35029318', system: 'imperial', aliases: ['stone', 'stones'] },
    { id: 'tonus', symbol: 'ton (EE. UU.)', name: { es: 'Tonelada corta', en: 'Short ton' }, plural: 'Toneladas cortas', factor: '907.18474', system: 'us', aliases: ['tonelada corta', 'short ton'] },
    { id: 'tonuk', symbol: 'ton (R. U.)', name: { es: 'Tonelada larga', en: 'Long ton' }, plural: 'Toneladas largas', factor: '1016.0469088', system: 'imperial', aliases: ['tonelada larga', 'long ton'] },
  ],
}
