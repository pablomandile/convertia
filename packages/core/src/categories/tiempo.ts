import type { CategoryDef } from '../types'

// Base: segundo. Mes y año son promedios del calendario gregoriano (365,2425 días).
export const tiempo: CategoryDef = {
  id: 'time',
  slug: 'tiempo',
  name: { es: 'Tiempo', en: 'Time' },
  baseUnit: 's',
  popular: [['h', 'min'], ['d', 'h'], ['min', 's'], ['yr', 'd'], ['wk', 'd']],
  units: [
    { id: 'ns', symbol: 'ns', name: { es: 'Nanosegundo', en: 'Nanosecond' }, factor: '1e-9', system: 'si', aliases: ['nanosegundo', 'nanosegundos'] },
    { id: 'us', symbol: 'µs', name: { es: 'Microsegundo', en: 'Microsecond' }, factor: '1e-6', system: 'si', aliases: ['microsegundo', 'microsegundos'] },
    { id: 'ms', symbol: 'ms', name: { es: 'Milisegundo', en: 'Millisecond' }, factor: '0.001', system: 'si', aliases: ['milisegundo', 'milisegundos'] },
    { id: 's', symbol: 's', name: { es: 'Segundo', en: 'Second' }, factor: '1', system: 'si', aliases: ['segundo', 'segundos', 'seg', 'sec'] },
    { id: 'min', symbol: 'min', name: { es: 'Minuto', en: 'Minute' }, factor: '60', system: 'otro', aliases: ['minuto', 'minutos', 'mins'] },
    { id: 'h', symbol: 'h', name: { es: 'Hora', en: 'Hour' }, factor: '3600', system: 'otro', aliases: ['hora', 'horas', 'hs', 'hr', 'hrs'] },
    { id: 'd', symbol: 'd', name: { es: 'Día', en: 'Day' }, factor: '86400', system: 'otro', aliases: ['dia', 'dias'] },
    { id: 'wk', symbol: 'sem', name: { es: 'Semana', en: 'Week' }, factor: '604800', system: 'otro', aliases: ['semana', 'semanas'] },
    { id: 'mo', symbol: 'mes', name: { es: 'Mes', en: 'Month' }, plural: 'Meses', factor: '2629746', system: 'otro', aliases: ['mes', 'meses'] },
    { id: 'yr', symbol: 'año', name: { es: 'Año', en: 'Year' }, factor: '31556952', system: 'otro', aliases: ['año', 'años', 'ano', 'anos'] },
    { id: 'dec', symbol: 'década', name: { es: 'Década', en: 'Decade' }, factor: '315569520', system: 'otro', aliases: ['decada', 'decadas'] },
    { id: 'cen', symbol: 'siglo', name: { es: 'Siglo', en: 'Century' }, factor: '3155695200', system: 'otro', aliases: ['siglo', 'siglos'] },
  ],
}
