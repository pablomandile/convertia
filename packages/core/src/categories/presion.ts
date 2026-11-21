import type { CategoryDef } from '../types'

// Base: pascal. psi = lbf/in² exacto.
export const presion: CategoryDef = {
  id: 'pressure',
  slug: 'presion',
  name: { es: 'Presión', en: 'Pressure' },
  baseUnit: 'Pa',
  popular: [['psi', 'bar'], ['bar', 'psi'], ['atm', 'kPa'], ['mmHg', 'kPa'], ['psi', 'kPa']],
  units: [
    { id: 'Pa', symbol: 'Pa', name: { es: 'Pascal', en: 'Pascal' }, plural: 'Pascales', factor: '1', system: 'si', aliases: ['pascal', 'pascales'] },
    { id: 'hPa', symbol: 'hPa', name: { es: 'Hectopascal', en: 'Hectopascal' }, plural: 'Hectopascales', factor: '100', system: 'si', aliases: ['hectopascal', 'hectopascales', 'hpa'] },
    { id: 'kPa', symbol: 'kPa', name: { es: 'Kilopascal', en: 'Kilopascal' }, plural: 'Kilopascales', factor: '1000', system: 'si', aliases: ['kilopascal', 'kilopascales', 'kpa'] },
    { id: 'MPa', symbol: 'MPa', name: { es: 'Megapascal', en: 'Megapascal' }, plural: 'Megapascales', factor: '1000000', system: 'si', aliases: ['megapascal', 'megapascales', 'mpa'] },
    { id: 'mbar', symbol: 'mbar', name: { es: 'Milibar', en: 'Millibar' }, plural: 'Milibares', factor: '100', system: 'métrico', aliases: ['milibar', 'milibares'] },
    { id: 'bar', symbol: 'bar', name: { es: 'Bar', en: 'Bar' }, plural: 'Bares', factor: '100000', system: 'métrico', aliases: ['bar', 'bares'] },
    { id: 'atm', symbol: 'atm', name: { es: 'Atmósfera', en: 'Atmosphere' }, factor: '101325', system: 'otro', aliases: ['atmosfera', 'atmosferas'] },
    { id: 'kgfcm2', symbol: 'kgf/cm²', name: { es: 'Kilogramo fuerza por cm²', en: 'Kilogram-force per cm²' }, plural: 'Kilogramos fuerza por cm²', factor: '98066.5', system: 'métrico', aliases: ['kg/cm2', 'kgf/cm2'] },
    { id: 'psi', symbol: 'psi', name: { es: 'Libra por pulgada cuadrada', en: 'Pound per square inch' }, plural: 'Libras por pulgada cuadrada', factor: '4.4482216152605/0.00064516', system: 'imperial', aliases: ['psi', 'lb/in2'] },
    { id: 'mmHg', symbol: 'mmHg', name: { es: 'Milímetro de mercurio', en: 'Millimeter of mercury' }, plural: 'Milímetros de mercurio', factor: '133.322387415', system: 'otro', aliases: ['mmhg', 'milimetros de mercurio'] },
    { id: 'torr', symbol: 'Torr', name: { es: 'Torr', en: 'Torr' }, plural: 'Torr', factor: '101325/760', system: 'otro', aliases: ['torr'] },
    { id: 'inHg', symbol: 'inHg', name: { es: 'Pulgada de mercurio', en: 'Inch of mercury' }, plural: 'Pulgadas de mercurio', factor: '3386.389', system: 'imperial', aliases: ['inhg', 'pulgadas de mercurio'] },
  ],
}
