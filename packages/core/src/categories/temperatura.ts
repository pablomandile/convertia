import type { CategoryDef } from '../types'

// Base: kelvin. base = valor · factor + offset
export const temperatura: CategoryDef = {
  id: 'temperature',
  slug: 'temperatura',
  name: { es: 'Temperatura', en: 'Temperature' },
  baseUnit: 'K',
  popular: [['C', 'F'], ['F', 'C'], ['C', 'K']],
  units: [
    { id: 'C', symbol: '°C', name: { es: 'Grado Celsius', en: 'Degree Celsius' }, plural: 'Grados Celsius', factor: '1', offset: '273.15', system: 'métrico', aliases: ['c', 'celsius', 'centigrados', 'grados'] },
    { id: 'F', symbol: '°F', name: { es: 'Grado Fahrenheit', en: 'Degree Fahrenheit' }, plural: 'Grados Fahrenheit', factor: '5/9', offset: '45967/180', system: 'imperial', aliases: ['f', 'fahrenheit'] },
    { id: 'K', symbol: 'K', name: { es: 'Kelvin', en: 'Kelvin' }, plural: 'Kelvin', factor: '1', offset: '0', system: 'si', aliases: ['k', 'kelvin', 'kelvins'] },
    { id: 'R', symbol: '°R', name: { es: 'Grado Rankine', en: 'Degree Rankine' }, plural: 'Grados Rankine', factor: '5/9', offset: '0', system: 'imperial', aliases: ['rankine'] },
  ],
}
