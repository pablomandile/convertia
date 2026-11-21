import type { CategoryDef } from '../types'

// Base: vatio. hp mecánico = 550 ft·lbf/s; CV (caballo de vapor métrico) = 75 kgf·m/s.
// Frigoría/h = kcal(IT)/h = 1,163 W, la unidad con la que se venden los aires en Argentina.
export const potencia: CategoryDef = {
  id: 'power',
  slug: 'potencia',
  name: { es: 'Potencia', en: 'Power' },
  baseUnit: 'W',
  popular: [['hp', 'kW'], ['kW', 'hp'], ['CV', 'kW'], ['BTUh', 'W'], ['frig', 'BTUh']],
  units: [
    { id: 'W', symbol: 'W', name: { es: 'Vatio', en: 'Watt' }, factor: '1', system: 'si', aliases: ['vatio', 'vatios', 'watt', 'watts'] },
    { id: 'kW', symbol: 'kW', name: { es: 'Kilovatio', en: 'Kilowatt' }, factor: '1000', system: 'si', aliases: ['kilovatio', 'kilovatios', 'kilowatt', 'kilowatts', 'kw'] },
    { id: 'MW', symbol: 'MW', name: { es: 'Megavatio', en: 'Megawatt' }, factor: '1000000', system: 'si', aliases: ['megavatio', 'megavatios', 'megawatt'] },
    { id: 'hp', symbol: 'hp', name: { es: 'Caballo de fuerza', en: 'Horsepower' }, plural: 'Caballos de fuerza', factor: '745.69987158227022', system: 'imperial', aliases: ['caballo de fuerza', 'caballos de fuerza', 'horsepower'] },
    { id: 'CV', symbol: 'CV', name: { es: 'Caballo de vapor', en: 'Metric horsepower' }, plural: 'Caballos de vapor', factor: '735.49875', system: 'métrico', aliases: ['caballo de vapor', 'caballos de vapor', 'cv', 'ps'] },
    { id: 'BTUh', symbol: 'BTU/h', name: { es: 'BTU por hora', en: 'BTU per hour' }, plural: 'BTU por hora', factor: '1055.05585262/3600', system: 'imperial', aliases: ['btu/h', 'btu por hora', 'btuh'] },
    { id: 'frig', symbol: 'frig/h', name: { es: 'Frigoría por hora', en: 'Frigorie per hour' }, plural: 'Frigorías por hora', factor: '1.163', system: 'métrico', aliases: ['frigoria', 'frigorias', 'frigorias por hora', 'kcal/h'] },
    { id: 'TR', symbol: 'TR', name: { es: 'Tonelada de refrigeración', en: 'Refrigeration ton' }, plural: 'Toneladas de refrigeración', factor: '12660670.23144/3600', system: 'us', aliases: ['tonelada de refrigeracion', 'toneladas de refrigeracion'] },
  ],
}
