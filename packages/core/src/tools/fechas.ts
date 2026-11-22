// Fechas y horas: diferencia entre fechas, edad, timestamp Unix y husos horarios.
// Las fechas "de calendario" (sin hora) se manejan como "AAAA-MM-DD" para no depender del huso del navegador.

export interface CalendarDate { y: number, m: number, d: number }

export function parseISODate(text: string): CalendarDate | undefined {
  const m = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return undefined
  const date = { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) }
  return date.m >= 1 && date.m <= 12 && date.d >= 1 && date.d <= daysInMonth(date.y, date.m) ? date : undefined
}

export function toISODate({ y, m, d }: CalendarDate): string {
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

/** Días desde 1970-01-01 (sin husos horarios de por medio). */
function dayNumber({ y, m, d }: CalendarDate): number {
  return Math.round(Date.UTC(y, m - 1, d) / 86400000)
}

function compare(a: CalendarDate, b: CalendarDate): number {
  return dayNumber(a) - dayNumber(b)
}

/** 0 = domingo … 6 = sábado */
export function weekday(date: CalendarDate): number {
  return new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay()
}

/** Diferencia de calendario: años, meses y días, más totales. Siempre en positivo (`negative` indica el orden). */
export function dateDiff(fromDate: CalendarDate, toDate: CalendarDate, holidays?: ReadonlySet<string>) {
  const negative = compare(toDate, fromDate) < 0
  const [a, b] = negative ? [toDate, fromDate] : [fromDate, toDate]
  // Meses enteros que entran (31/1 + 1 mes = 29/2), y los días que sobran.
  let totalMonths = (b.y - a.y) * 12 + (b.m - a.m)
  if (compare(addMonths(a, totalMonths), b) > 0) totalMonths--
  const days = dayNumber(b) - dayNumber(addMonths(a, totalMonths))
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const totalDays = dayNumber(b) - dayNumber(a)
  return {
    negative,
    years,
    months,
    days,
    totalDays,
    totalWeeks: Math.floor(totalDays / 7),
    totalMonths,
    businessDays: businessDaysBetween(a, b, holidays),
  }
}

/** Días de lunes a viernes en [desde, hasta), descontando los feriados dados ("AAAA-MM-DD"). */
export function businessDaysBetween(from: CalendarDate, to: CalendarDate, holidays?: ReadonlySet<string>): number {
  const start = dayNumber(from)
  const end = dayNumber(to)
  let count = 0
  // 1970-01-01 fue jueves (4).
  for (let n = start; n < end; n++) {
    const wd = ((n % 7) + 7 + 4) % 7
    if (wd === 0 || wd === 6) continue
    if (holidays?.size && holidays.has(new Date(n * 86400000).toISOString().slice(0, 10))) continue
    count++
  }
  return count
}

/** Suma meses; si el día no existe en el mes de llegada, queda en el último (31/1 + 1 = 28 o 29/2). */
export function addMonths(date: CalendarDate, months: number): CalendarDate {
  const index = date.y * 12 + (date.m - 1) + months
  const y = Math.floor(index / 12)
  const m = index - y * 12 + 1
  return { y, m, d: Math.min(date.d, daysInMonth(y, m)) }
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const t = new Date(Date.UTC(date.y, date.m - 1, date.d + days))
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() }
}

/** Edad exacta y próximo cumpleaños (el 29/2 se festeja el 28/2 en años no bisiestos). */
export function age(birth: CalendarDate, today: CalendarDate) {
  const diff = dateDiff(birth, today)
  if (diff.negative) throw new RangeError('La fecha de nacimiento es posterior a hoy')
  const birthdayIn = (y: number): CalendarDate => ({ y, m: birth.m, d: Math.min(birth.d, daysInMonth(y, birth.m)) })
  let next = birthdayIn(today.y)
  if (compare(next, today) < 0) next = birthdayIn(today.y + 1)
  return {
    ...diff,
    nextBirthday: next,
    daysToBirthday: dayNumber(next) - dayNumber(today),
    turning: next.y - birth.y,
    bornWeekday: weekday(birth),
  }
}

// --- Timestamp Unix ---------------------------------------------------------------------

/** Acepta segundos o milisegundos: más de 12 dígitos se toma como milisegundos. */
export function fromUnix(value: number): { ms: number, unit: 's' | 'ms' } {
  if (!Number.isFinite(value)) throw new RangeError('Timestamp inválido')
  const unit = Math.abs(value) >= 1e12 ? 'ms' : 's'
  return { ms: unit === 'ms' ? value : value * 1000, unit }
}

// --- Husos horarios ------------------------------------------------------------------

const formatters = new Map<string, Intl.DateTimeFormat>()
function formatter(timeZone: string) {
  let f = formatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    formatters.set(timeZone, f)
  }
  return f
}

/** Hora de pared en un huso, para un instante. */
export function wallTime(ms: number, timeZone: string) {
  const parts = Object.fromEntries(formatter(timeZone).formatToParts(new Date(ms)).map(p => [p.type, p.value]))
  return { y: Number(parts.year), m: Number(parts.month), d: Number(parts.day), h: Number(parts.hour), min: Number(parts.minute), s: Number(parts.second) }
}

/** Diferencia con UTC en minutos (Buenos Aires: -180). */
export function zoneOffsetMinutes(ms: number, timeZone: string): number {
  const w = wallTime(ms, timeZone)
  const asUTC = Date.UTC(w.y, w.m - 1, w.d, w.h, w.min, w.s)
  return Math.round((asUTC - Math.floor(ms / 1000) * 1000) / 60000)
}

/** Instante que corresponde a una hora de pared en un huso (resuelve el horario de verano). */
export function zonedToInstant(date: CalendarDate, h: number, min: number, timeZone: string): number {
  const naive = Date.UTC(date.y, date.m - 1, date.d, h, min)
  let ms = naive - zoneOffsetMinutes(naive, timeZone) * 60000
  ms = naive - zoneOffsetMinutes(ms, timeZone) * 60000
  return ms
}

export function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '−' : '+'
  const abs = Math.abs(minutes)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`
}

export interface City { name: string, country: string, tz: string }

export const CITIES: City[] = [
  { name: 'Buenos Aires', country: 'Argentina', tz: 'America/Argentina/Buenos_Aires' },
  { name: 'Montevideo', country: 'Uruguay', tz: 'America/Montevideo' },
  { name: 'Santiago', country: 'Chile', tz: 'America/Santiago' },
  { name: 'Asunción', country: 'Paraguay', tz: 'America/Asuncion' },
  { name: 'São Paulo', country: 'Brasil', tz: 'America/Sao_Paulo' },
  { name: 'La Paz', country: 'Bolivia', tz: 'America/La_Paz' },
  { name: 'Lima', country: 'Perú', tz: 'America/Lima' },
  { name: 'Bogotá', country: 'Colombia', tz: 'America/Bogota' },
  { name: 'Caracas', country: 'Venezuela', tz: 'America/Caracas' },
  { name: 'Ciudad de México', country: 'México', tz: 'America/Mexico_City' },
  { name: 'Nueva York', country: 'EE. UU.', tz: 'America/New_York' },
  { name: 'Miami', country: 'EE. UU.', tz: 'America/New_York' },
  { name: 'Chicago', country: 'EE. UU.', tz: 'America/Chicago' },
  { name: 'Los Ángeles', country: 'EE. UU.', tz: 'America/Los_Angeles' },
  { name: 'Toronto', country: 'Canadá', tz: 'America/Toronto' },
  { name: 'Londres', country: 'Reino Unido', tz: 'Europe/London' },
  { name: 'Lisboa', country: 'Portugal', tz: 'Europe/Lisbon' },
  { name: 'Madrid', country: 'España', tz: 'Europe/Madrid' },
  { name: 'París', country: 'Francia', tz: 'Europe/Paris' },
  { name: 'Roma', country: 'Italia', tz: 'Europe/Rome' },
  { name: 'Berlín', country: 'Alemania', tz: 'Europe/Berlin' },
  { name: 'Moscú', country: 'Rusia', tz: 'Europe/Moscow' },
  { name: 'Tel Aviv', country: 'Israel', tz: 'Asia/Jerusalem' },
  { name: 'Dubái', country: 'Emiratos Árabes', tz: 'Asia/Dubai' },
  { name: 'Nueva Delhi', country: 'India', tz: 'Asia/Kolkata' },
  { name: 'Bangkok', country: 'Tailandia', tz: 'Asia/Bangkok' },
  { name: 'Pekín', country: 'China', tz: 'Asia/Shanghai' },
  { name: 'Tokio', country: 'Japón', tz: 'Asia/Tokyo' },
  { name: 'Sídney', country: 'Australia', tz: 'Australia/Sydney' },
  { name: 'Auckland', country: 'Nueva Zelanda', tz: 'Pacific/Auckland' },
  { name: 'UTC', country: 'Tiempo universal', tz: 'UTC' },
]
