import type { CategoryDef } from '../types'

// Base: joule. Caloría termoquímica (4,184 J); BTU internacional.
export const energia: CategoryDef = {
  id: 'energy',
  slug: 'energia',
  name: { es: 'Energía', en: 'Energy' },
  baseUnit: 'J',
  popular: [['kcal', 'kJ'], ['kJ', 'kcal'], ['kWh', 'J'], ['BTU', 'kJ'], ['cal', 'J']],
  units: [
    { id: 'J', symbol: 'J', name: { es: 'Joule', en: 'Joule' }, factor: '1', system: 'si', aliases: ['joule', 'joules', 'julio', 'julios'] },
    { id: 'kJ', symbol: 'kJ', name: { es: 'Kilojoule', en: 'Kilojoule' }, factor: '1000', system: 'si', aliases: ['kilojoule', 'kilojoules', 'kj'] },
    { id: 'MJ', symbol: 'MJ', name: { es: 'Megajoule', en: 'Megajoule' }, factor: '1000000', system: 'si', aliases: ['megajoule', 'megajoules'] },
    { id: 'cal', symbol: 'cal', name: { es: 'Caloría', en: 'Calorie' }, factor: '4.184', system: 'métrico', aliases: ['caloria', 'calorias'] },
    { id: 'kcal', symbol: 'kcal', name: { es: 'Kilocaloría', en: 'Kilocalorie' }, factor: '4184', system: 'métrico', aliases: ['kilocaloria', 'kilocalorias', 'calorias alimentarias'] },
    { id: 'Wh', symbol: 'Wh', name: { es: 'Vatio hora', en: 'Watt-hour' }, plural: 'Vatios hora', factor: '3600', system: 'si', aliases: ['vatio hora', 'watt hora', 'wh'] },
    { id: 'kWh', symbol: 'kWh', name: { es: 'Kilovatio hora', en: 'Kilowatt-hour' }, plural: 'Kilovatios hora', factor: '3600000', system: 'si', aliases: ['kilovatio hora', 'kilowatt hora', 'kwh'] },
    { id: 'BTU', symbol: 'BTU', name: { es: 'BTU', en: 'British thermal unit' }, plural: 'BTU', factor: '1055.05585262', system: 'imperial', aliases: ['btu', 'btus'] },
    { id: 'thm', symbol: 'thm', name: { es: 'Termia (EE. UU.)', en: 'US therm' }, plural: 'Termias (EE. UU.)', factor: '105480400', system: 'us', aliases: ['termia', 'termias', 'therm'] },
    { id: 'ftlbf', symbol: 'ft·lbf', name: { es: 'Pie-libra fuerza', en: 'Foot-pound force' }, plural: 'Pies-libra fuerza', factor: '1.3558179483314004', system: 'imperial', aliases: ['pie libra', 'ft lbf'] },
    { id: 'eV', symbol: 'eV', name: { es: 'Electronvoltio', en: 'Electronvolt' }, factor: '1.602176634e-19', system: 'otro', aliases: ['electronvoltio', 'electronvoltios', 'ev'] },
  ],
}
