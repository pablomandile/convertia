import type { CategoryDef } from '../types'

// Base: kilogramo por metro cúbico.
export const densidad: CategoryDef = {
  id: 'density',
  slug: 'densidad',
  name: { es: 'Densidad', en: 'Density' },
  baseUnit: 'kgm3',
  popular: [['gcm3', 'kgm3'], ['kgm3', 'gcm3'], ['lbft3', 'kgm3']],
  units: [
    { id: 'kgm3', symbol: 'kg/m³', name: { es: 'Kilogramo por metro cúbico', en: 'Kilogram per cubic meter' }, plural: 'Kilogramos por metro cúbico', factor: '1', system: 'si', aliases: ['kg/m3'] },
    { id: 'gL', symbol: 'g/L', name: { es: 'Gramo por litro', en: 'Gram per liter' }, plural: 'Gramos por litro', factor: '1', system: 'métrico', aliases: ['g/l'] },
    { id: 'gcm3', symbol: 'g/cm³', name: { es: 'Gramo por centímetro cúbico', en: 'Gram per cubic centimeter' }, plural: 'Gramos por centímetro cúbico', factor: '1000', system: 'métrico', aliases: ['g/cm3', 'g/ml'] },
    { id: 'kgL', symbol: 'kg/L', name: { es: 'Kilogramo por litro', en: 'Kilogram per liter' }, plural: 'Kilogramos por litro', factor: '1000', system: 'métrico', aliases: ['kg/l'] },
    { id: 'lbft3', symbol: 'lb/ft³', name: { es: 'Libra por pie cúbico', en: 'Pound per cubic foot' }, plural: 'Libras por pie cúbico', factor: '0.45359237/0.028316846592', system: 'imperial', aliases: ['lb/ft3'] },
    { id: 'lbgal', symbol: 'lb/gal', name: { es: 'Libra por galón (EE. UU.)', en: 'Pound per US gallon' }, plural: 'Libras por galón (EE. UU.)', factor: '0.45359237/0.003785411784', system: 'us', aliases: ['lb/gal'] },
    { id: 'ozin3', symbol: 'oz/in³', name: { es: 'Onza por pulgada cúbica', en: 'Ounce per cubic inch' }, plural: 'Onzas por pulgada cúbica', factor: '0.028349523125/0.000016387064', system: 'imperial', aliases: ['oz/in3'] },
  ],
}
