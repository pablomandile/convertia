import { toISODate, type CalendarDate } from '@convertia/core'

export const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

/** Hoy según el reloj del dispositivo, como "AAAA-MM-DD". Solo en el navegador (no en el prerender). */
export function todayISO(): string {
  const now = new Date()
  return toISODate({ y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() })
}

export function longDate({ y, m, d }: CalendarDate): string {
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-AR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n.toLocaleString('es-AR')} ${n === 1 ? singular : pluralForm}`
}

/** "2 años, 3 meses y 5 días" (omite los ceros). */
export function ymdText(years: number, months: number, days: number): string {
  const parts = [
    years ? plural(years, 'año') : '',
    months ? plural(months, 'mes', 'meses') : '',
    days ? plural(days, 'día') : '',
  ].filter(Boolean)
  if (!parts.length) return '0 días'
  return parts.length === 1 ? parts[0]! : `${parts.slice(0, -1).join(', ')} y ${parts.at(-1)}`
}
