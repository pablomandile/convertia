import type { CategoryDef } from '../types'

// Base: km/L. Litros cada 100 km es INVERSA: más litros = menos km por litro.
export const combustible: CategoryDef = {
  id: 'fuel',
  slug: 'consumo-de-combustible',
  name: { es: 'Consumo de combustible', en: 'Fuel economy' },
  baseUnit: 'kml',
  popular: [['mpg', 'l100km'], ['l100km', 'mpg'], ['kml', 'l100km'], ['l100km', 'kml']],
  units: [
    { id: 'kml', symbol: 'km/L', name: { es: 'Kilómetros por litro', en: 'Kilometers per liter' }, plural: 'Kilómetros por litro', factor: '1', system: 'métrico', aliases: ['km/l', 'kilometros por litro', 'kml'] },
    { id: 'l100km', symbol: 'L/100 km', name: { es: 'Litros cada 100 km', en: 'Liters per 100 km' }, plural: 'Litros cada 100 km', factor: '100', inverse: true, system: 'métrico', aliases: ['l/100km', 'l/100 km', 'litros cada 100 km', 'litros por 100 km'] },
    { id: 'mpg', symbol: 'mpg (EE. UU.)', name: { es: 'Millas por galón (EE. UU.)', en: 'Miles per US gallon' }, plural: 'Millas por galón (EE. UU.)', factor: '1.609344/3.785411784', system: 'us', aliases: ['mpg', 'millas por galon'] },
    { id: 'mpguk', symbol: 'mpg (R. U.)', name: { es: 'Millas por galón (R. U.)', en: 'Miles per imperial gallon' }, plural: 'Millas por galón (R. U.)', factor: '1.609344/4.54609', system: 'imperial', aliases: ['mpg imperial', 'mpg uk'] },
    { id: 'mil', symbol: 'mi/L', name: { es: 'Millas por litro', en: 'Miles per liter' }, plural: 'Millas por litro', factor: '1.609344', system: 'otro', aliases: ['mi/l', 'millas por litro'] },
  ],
}
