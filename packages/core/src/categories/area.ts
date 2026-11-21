import type { CategoryDef } from '../types'

// Base: metro cuadrado.
export const area: CategoryDef = {
  id: 'area',
  slug: 'area',
  name: { es: 'Área y superficie', en: 'Area' },
  baseUnit: 'm2',
  popular: [['ft2', 'm2'], ['m2', 'ft2'], ['ac', 'ha'], ['ha', 'ac'], ['km2', 'mi2']],
  units: [
    { id: 'mm2', symbol: 'mm²', name: { es: 'Milímetro cuadrado', en: 'Square millimeter' }, plural: 'Milímetros cuadrados', factor: '0.000001', system: 'si', aliases: ['milimetro cuadrado', 'milimetros cuadrados', 'mm2'] },
    { id: 'cm2', symbol: 'cm²', name: { es: 'Centímetro cuadrado', en: 'Square centimeter' }, plural: 'Centímetros cuadrados', factor: '0.0001', system: 'si', aliases: ['centimetro cuadrado', 'centimetros cuadrados', 'cm2'] },
    { id: 'm2', symbol: 'm²', name: { es: 'Metro cuadrado', en: 'Square meter' }, plural: 'Metros cuadrados', factor: '1', system: 'si', aliases: ['metro cuadrado', 'metros cuadrados', 'm2', 'mts2'] },
    { id: 'a', symbol: 'a', name: { es: 'Área', en: 'Are' }, factor: '100', system: 'métrico', aliases: ['area', 'areas'] },
    { id: 'ha', symbol: 'ha', name: { es: 'Hectárea', en: 'Hectare' }, factor: '10000', system: 'métrico', aliases: ['hectarea', 'hectareas'] },
    { id: 'km2', symbol: 'km²', name: { es: 'Kilómetro cuadrado', en: 'Square kilometer' }, plural: 'Kilómetros cuadrados', factor: '1000000', system: 'si', aliases: ['kilometro cuadrado', 'kilometros cuadrados', 'km2'] },
    { id: 'in2', symbol: 'in²', name: { es: 'Pulgada cuadrada', en: 'Square inch' }, plural: 'Pulgadas cuadradas', factor: '0.00064516', system: 'imperial', aliases: ['pulgada cuadrada', 'pulgadas cuadradas', 'in2'] },
    { id: 'ft2', symbol: 'ft²', name: { es: 'Pie cuadrado', en: 'Square foot' }, plural: 'Pies cuadrados', factor: '0.09290304', system: 'imperial', aliases: ['pie cuadrado', 'pies cuadrados', 'ft2', 'sqft'] },
    { id: 'yd2', symbol: 'yd²', name: { es: 'Yarda cuadrada', en: 'Square yard' }, plural: 'Yardas cuadradas', factor: '0.83612736', system: 'imperial', aliases: ['yarda cuadrada', 'yardas cuadradas', 'yd2'] },
    { id: 'ac', symbol: 'ac', name: { es: 'Acre', en: 'Acre' }, factor: '4046.8564224', system: 'imperial', aliases: ['acre', 'acres'] },
    { id: 'mi2', symbol: 'mi²', name: { es: 'Milla cuadrada', en: 'Square mile' }, plural: 'Millas cuadradas', factor: '2589988.110336', system: 'imperial', aliases: ['milla cuadrada', 'millas cuadradas', 'mi2'] },
  ],
}
