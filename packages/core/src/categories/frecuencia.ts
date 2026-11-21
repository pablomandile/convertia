import type { CategoryDef } from '../types'

// Base: hercio.
export const frecuencia: CategoryDef = {
  id: 'frequency',
  slug: 'frecuencia',
  name: { es: 'Frecuencia', en: 'Frequency' },
  baseUnit: 'Hz',
  popular: [['MHz', 'GHz'], ['rpm', 'Hz'], ['Hz', 'rpm']],
  units: [
    { id: 'Hz', symbol: 'Hz', name: { es: 'Hercio', en: 'Hertz' }, factor: '1', system: 'si', aliases: ['hercio', 'hercios', 'hertz', 'hz'] },
    { id: 'kHz', symbol: 'kHz', name: { es: 'Kilohercio', en: 'Kilohertz' }, factor: '1000', system: 'si', aliases: ['kilohercio', 'kilohercios', 'khz'] },
    { id: 'MHz', symbol: 'MHz', name: { es: 'Megahercio', en: 'Megahertz' }, factor: '1000000', system: 'si', aliases: ['megahercio', 'megahercios', 'mhz'] },
    { id: 'GHz', symbol: 'GHz', name: { es: 'Gigahercio', en: 'Gigahertz' }, factor: '1000000000', system: 'si', aliases: ['gigahercio', 'gigahercios', 'ghz'] },
    { id: 'THz', symbol: 'THz', name: { es: 'Terahercio', en: 'Terahertz' }, factor: '1000000000000', system: 'si', aliases: ['terahercio', 'terahercios', 'thz'] },
    { id: 'rpm', symbol: 'rpm', name: { es: 'Revoluciones por minuto', en: 'Revolutions per minute' }, plural: 'Revoluciones por minuto', factor: '1/60', system: 'otro', aliases: ['rpm', 'revoluciones por minuto', 'bpm'] },
  ],
}
