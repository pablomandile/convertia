import type { CategoryDef } from '../types'

// Base: metro. Las definiciones imperiales son exactas (1 in = 0,0254 m, acuerdo de 1959).
export const longitud: CategoryDef = {
  id: 'length',
  slug: 'longitud',
  name: { es: 'Longitud', en: 'Length' },
  baseUnit: 'm',
  popular: [['ft', 'm'], ['in', 'cm'], ['km', 'mi'], ['mi', 'km'], ['m', 'ft'], ['cm', 'in']],
  units: [
    { id: 'nm', symbol: 'nm', name: { es: 'Nanómetro', en: 'Nanometer' }, factor: '1e-9', system: 'si', aliases: ['nanometro', 'nanometros'] },
    { id: 'um', symbol: 'µm', name: { es: 'Micrómetro', en: 'Micrometer' }, factor: '1e-6', system: 'si', aliases: ['micra', 'micras', 'micrometro', 'micrometros'] },
    { id: 'mm', symbol: 'mm', name: { es: 'Milímetro', en: 'Millimeter' }, factor: '0.001', system: 'si', aliases: ['milimetro', 'milimetros'] },
    { id: 'cm', symbol: 'cm', name: { es: 'Centímetro', en: 'Centimeter' }, factor: '0.01', system: 'si', aliases: ['centimetro', 'centimetros'] },
    { id: 'dm', symbol: 'dm', name: { es: 'Decímetro', en: 'Decimeter' }, factor: '0.1', system: 'si', aliases: ['decimetro', 'decimetros'] },
    { id: 'm', symbol: 'm', name: { es: 'Metro', en: 'Meter' }, factor: '1', system: 'si', aliases: ['metro', 'metros', 'mts', 'mt'] },
    { id: 'km', symbol: 'km', name: { es: 'Kilómetro', en: 'Kilometer' }, factor: '1000', system: 'si', aliases: ['kilometro', 'kilometros', 'kms'] },
    { id: 'in', symbol: 'in', name: { es: 'Pulgada', en: 'Inch' }, factor: '0.0254', system: 'imperial', aliases: ['pulgada', 'pulgadas', 'inch', 'inches', '"', '″'] },
    { id: 'ft', symbol: 'ft', name: { es: 'Pie', en: 'Foot' }, plural: 'Pies', factor: '0.3048', system: 'imperial', aliases: ['pie', 'pies', 'foot', 'feet', "'", '′'] },
    { id: 'yd', symbol: 'yd', name: { es: 'Yarda', en: 'Yard' }, factor: '0.9144', system: 'imperial', aliases: ['yarda', 'yardas', 'yard', 'yards'] },
    { id: 'mi', symbol: 'mi', name: { es: 'Milla', en: 'Mile' }, factor: '1609.344', system: 'imperial', aliases: ['milla', 'millas', 'mile', 'miles'] },
    { id: 'nmi', symbol: 'nmi', name: { es: 'Milla náutica', en: 'Nautical mile' }, plural: 'Millas náuticas', factor: '1852', system: 'otro', aliases: ['milla nautica', 'millas nauticas'] },
  ],
}
