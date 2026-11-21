import type { CategoryDef } from '../types'

// Base: litro. Las medidas de EE. UU. y del R. U. son distintas: van separadas.
export const volumen: CategoryDef = {
  id: 'volume',
  slug: 'volumen',
  name: { es: 'Volumen', en: 'Volume' },
  baseUnit: 'l',
  popular: [['gal', 'l'], ['l', 'gal'], ['floz', 'ml'], ['cup', 'ml'], ['m3', 'l'], ['tbsp', 'ml']],
  units: [
    { id: 'ml', symbol: 'ml', name: { es: 'Mililitro', en: 'Milliliter' }, factor: '0.001', system: 'si', aliases: ['mililitro', 'mililitros', 'cc'] },
    { id: 'cl', symbol: 'cl', name: { es: 'Centilitro', en: 'Centiliter' }, factor: '0.01', system: 'si', aliases: ['centilitro', 'centilitros'] },
    { id: 'dl', symbol: 'dl', name: { es: 'Decilitro', en: 'Deciliter' }, factor: '0.1', system: 'si', aliases: ['decilitro', 'decilitros'] },
    { id: 'l', symbol: 'L', name: { es: 'Litro', en: 'Liter' }, factor: '1', system: 'si', aliases: ['litro', 'litros', 'lt', 'lts'] },
    { id: 'cm3', symbol: 'cm³', name: { es: 'Centímetro cúbico', en: 'Cubic centimeter' }, plural: 'Centímetros cúbicos', factor: '0.001', system: 'si', aliases: ['centimetro cubico', 'centimetros cubicos', 'cm3'] },
    { id: 'm3', symbol: 'm³', name: { es: 'Metro cúbico', en: 'Cubic meter' }, plural: 'Metros cúbicos', factor: '1000', system: 'si', aliases: ['metro cubico', 'metros cubicos', 'm3'] },
    { id: 'tsp', symbol: 'cdta', name: { es: 'Cucharadita (EE. UU.)', en: 'US teaspoon' }, plural: 'Cucharaditas (EE. UU.)', factor: '0.00492892159375', system: 'us', aliases: ['cucharadita', 'cucharaditas', 'cdta', 'tsp', 'teaspoon'] },
    { id: 'tbsp', symbol: 'cda', name: { es: 'Cucharada (EE. UU.)', en: 'US tablespoon' }, plural: 'Cucharadas (EE. UU.)', factor: '0.01478676478125', system: 'us', aliases: ['cucharada', 'cucharadas', 'cda', 'tbsp', 'tablespoon'] },
    { id: 'floz', symbol: 'fl oz', name: { es: 'Onza líquida (EE. UU.)', en: 'US fluid ounce' }, plural: 'Onzas líquidas (EE. UU.)', factor: '0.0295735295625', system: 'us', aliases: ['onza liquida', 'onzas liquidas', 'fl oz', 'floz'] },
    { id: 'cup', symbol: 'taza', name: { es: 'Taza (EE. UU.)', en: 'US cup' }, plural: 'Tazas (EE. UU.)', factor: '0.2365882365', system: 'us', aliases: ['taza', 'tazas', 'cup', 'cups'] },
    { id: 'cupm', symbol: 'taza m.', name: { es: 'Taza métrica', en: 'Metric cup' }, plural: 'Tazas métricas', factor: '0.25', system: 'métrico', aliases: ['taza metrica', 'tazas metricas'] },
    { id: 'pt', symbol: 'pt', name: { es: 'Pinta (EE. UU.)', en: 'US pint' }, plural: 'Pintas (EE. UU.)', factor: '0.473176473', system: 'us', aliases: ['pinta', 'pintas', 'pint'] },
    { id: 'qt', symbol: 'qt', name: { es: 'Cuarto de galón (EE. UU.)', en: 'US quart' }, plural: 'Cuartos de galón (EE. UU.)', factor: '0.946352946', system: 'us', aliases: ['quart', 'cuarto de galon'] },
    { id: 'gal', symbol: 'gal', name: { es: 'Galón (EE. UU.)', en: 'US gallon' }, plural: 'Galones (EE. UU.)', factor: '3.785411784', system: 'us', aliases: ['galon', 'galones', 'gallon', 'gallons'] },
    { id: 'flozuk', symbol: 'fl oz imp.', name: { es: 'Onza líquida (R. U.)', en: 'Imperial fluid ounce' }, plural: 'Onzas líquidas (R. U.)', factor: '0.0284130625', system: 'imperial' },
    { id: 'ptuk', symbol: 'pt imp.', name: { es: 'Pinta (R. U.)', en: 'Imperial pint' }, plural: 'Pintas (R. U.)', factor: '0.56826125', system: 'imperial', aliases: ['pinta inglesa'] },
    { id: 'galuk', symbol: 'gal imp.', name: { es: 'Galón (R. U.)', en: 'Imperial gallon' }, plural: 'Galones (R. U.)', factor: '4.54609', system: 'imperial', aliases: ['galon imperial', 'galon ingles'] },
    { id: 'in3', symbol: 'in³', name: { es: 'Pulgada cúbica', en: 'Cubic inch' }, plural: 'Pulgadas cúbicas', factor: '0.016387064', system: 'imperial', aliases: ['pulgada cubica', 'pulgadas cubicas', 'in3'] },
    { id: 'ft3', symbol: 'ft³', name: { es: 'Pie cúbico', en: 'Cubic foot' }, plural: 'Pies cúbicos', factor: '28.316846592', system: 'imperial', aliases: ['pie cubico', 'pies cubicos', 'ft3'] },
    { id: 'bbl', symbol: 'bbl', name: { es: 'Barril de petróleo', en: 'Oil barrel' }, plural: 'Barriles de petróleo', factor: '158.987294928', system: 'us', aliases: ['barril', 'barriles', 'barrel'] },
  ],
}
