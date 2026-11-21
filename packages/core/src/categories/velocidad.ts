import type { CategoryDef } from '../types'

// Base: metro por segundo.
export const velocidad: CategoryDef = {
  id: 'speed',
  slug: 'velocidad',
  name: { es: 'Velocidad', en: 'Speed' },
  baseUnit: 'mps',
  popular: [['mph', 'kmh'], ['kmh', 'mph'], ['kn', 'kmh'], ['mps', 'kmh']],
  units: [
    { id: 'mps', symbol: 'm/s', name: { es: 'Metro por segundo', en: 'Meter per second' }, plural: 'Metros por segundo', factor: '1', system: 'si', aliases: ['metros por segundo', 'm/s'] },
    { id: 'kmh', symbol: 'km/h', name: { es: 'Kilómetro por hora', en: 'Kilometer per hour' }, plural: 'Kilómetros por hora', factor: '5/18', system: 'métrico', aliases: ['kilometros por hora', 'km/h', 'kph'] },
    { id: 'mph', symbol: 'mph', name: { es: 'Milla por hora', en: 'Mile per hour' }, plural: 'Millas por hora', factor: '0.44704', system: 'imperial', aliases: ['millas por hora', 'mi/h'] },
    { id: 'fps', symbol: 'ft/s', name: { es: 'Pie por segundo', en: 'Foot per second' }, plural: 'Pies por segundo', factor: '0.3048', system: 'imperial', aliases: ['pies por segundo', 'ft/s'] },
    { id: 'kn', symbol: 'kn', name: { es: 'Nudo', en: 'Knot' }, factor: '463/900', system: 'otro', aliases: ['nudo', 'nudos', 'knot', 'knots', 'kt'] },
  ],
}
