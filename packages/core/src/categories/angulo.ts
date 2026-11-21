import type { CategoryDef } from '../types'

// Base: grado sexagesimal (así casi todos los factores son exactos; solo el radián usa π).
export const angulo: CategoryDef = {
  id: 'angle',
  slug: 'angulo',
  name: { es: 'Ángulo', en: 'Angle' },
  baseUnit: 'deg',
  popular: [['deg', 'rad'], ['rad', 'deg'], ['deg', 'grad']],
  units: [
    { id: 'deg', symbol: '°', name: { es: 'Grado', en: 'Degree' }, factor: '1', system: 'otro', aliases: ['grado', 'grados', 'deg', '°'] },
    { id: 'rad', symbol: 'rad', name: { es: 'Radián', en: 'Radian' }, plural: 'Radianes', factor: '57.29577951308232087679815481410517', system: 'si', aliases: ['radian', 'radianes'] },
    { id: 'grad', symbol: 'gon', name: { es: 'Gradián', en: 'Gradian' }, plural: 'Gradianes', factor: '0.9', system: 'otro', aliases: ['gradian', 'gradianes', 'gon', 'centesimal'] },
    { id: 'arcmin', symbol: '′', name: { es: 'Minuto de arco', en: 'Arcminute' }, plural: 'Minutos de arco', factor: '1/60', system: 'otro', aliases: ['minuto de arco', 'minutos de arco', 'arcmin'] },
    { id: 'arcsec', symbol: '″', name: { es: 'Segundo de arco', en: 'Arcsecond' }, plural: 'Segundos de arco', factor: '1/3600', system: 'otro', aliases: ['segundo de arco', 'segundos de arco', 'arcsec'] },
    { id: 'turn', symbol: 'vuelta', name: { es: 'Vuelta', en: 'Turn' }, factor: '360', system: 'otro', aliases: ['vuelta', 'vueltas', 'revolucion', 'revoluciones'] },
    { id: 'mil', symbol: 'mil', name: { es: 'Milésima angular (OTAN)', en: 'NATO mil' }, plural: 'Milésimas angulares (OTAN)', factor: '0.05625', system: 'otro', aliases: ['milesima', 'milesimas'] },
  ],
}
