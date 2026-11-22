import { describe, expect, it } from 'vitest'
import {
  addDays, addMonths, age, businessDaysBetween, CITIES, dateDiff, daysInMonth, formatOffset, fromUnix, parseISODate,
  toISODate, wallTime, weekday, zonedToInstant, zoneOffsetMinutes,
} from '../src'

const d = (s: string) => parseISODate(s)!

describe('fechas de calendario', () => {
  it('valida', () => {
    expect(parseISODate('2024-02-29')).toEqual({ y: 2024, m: 2, d: 29 })
    expect(parseISODate('2023-02-29')).toBeUndefined()
    expect(parseISODate('2024-13-01')).toBeUndefined()
    expect(toISODate(d('2024-02-29'))).toBe('2024-02-29')
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2100, 2)).toBe(28)
  })

  it('diferencia de calendario', () => {
    expect(dateDiff(d('2024-01-31'), d('2024-03-01'))).toMatchObject({ years: 0, months: 1, days: 1, totalDays: 30 })
    expect(dateDiff(d('2000-05-15'), d('2026-11-22'))).toMatchObject({ years: 26, months: 6, days: 7 })
    expect(dateDiff(d('2026-11-22'), d('2026-11-22'))).toMatchObject({ years: 0, months: 0, days: 0, totalDays: 0 })
    expect(dateDiff(d('2026-12-25'), d('2026-11-25'))).toMatchObject({ negative: true, months: 1, totalDays: 30 })
    expect(dateDiff(d('2024-02-29'), d('2025-02-28'))).toMatchObject({ years: 1, months: 0, days: 0 })
    expect(dateDiff(d('2026-01-15'), d('2026-03-10'))).toMatchObject({ months: 1, days: 23 })
  })

  it('diferencia: ida y vuelta con addMonths + addDays en muchos pares', () => {
    for (let i = 0; i < 400; i++) {
      const a = addDays(d('2020-01-01'), i * 7)
      const b = addDays(a, (i * 37) % 900)
      const r = dateDiff(a, b)
      expect(r.days).toBeGreaterThanOrEqual(0)
      expect(toISODate(addDays(addMonths(a, r.totalMonths), r.days))).toBe(toISODate(b))
    }
  })

  it('sumar meses ajusta fin de mes', () => {
    expect(addMonths(d('2024-01-31'), 1)).toEqual({ y: 2024, m: 2, d: 29 })
    expect(addMonths(d('2026-11-30'), 3)).toEqual({ y: 2027, m: 2, d: 28 })
    expect(addMonths(d('2026-03-15'), -3)).toEqual({ y: 2025, m: 12, d: 15 })
  })

  it('días hábiles (lunes a viernes)', () => {
    // Lunes 2026-11-16 a lunes 2026-11-23: 5 hábiles.
    expect(businessDaysBetween(d('2026-11-16'), d('2026-11-23'))).toBe(5)
    expect(businessDaysBetween(d('2026-11-21'), d('2026-11-23'))).toBe(0) // sábado y domingo
    expect(weekday(d('2026-11-22'))).toBe(0) // domingo
  })

  it('sumar días', () => {
    expect(addDays(d('2024-02-28'), 1)).toEqual({ y: 2024, m: 2, d: 29 })
    expect(addDays(d('2026-12-31'), 1)).toEqual({ y: 2027, m: 1, d: 1 })
    expect(addDays(d('2026-03-01'), -1)).toEqual({ y: 2026, m: 2, d: 28 })
  })

  it('edad y próximo cumpleaños', () => {
    const a = age(d('1990-11-25'), d('2026-11-22'))
    expect(a).toMatchObject({ years: 35, daysToBirthday: 3, turning: 36 })
    expect(age(d('2000-02-29'), d('2027-02-27')).nextBirthday).toEqual({ y: 2027, m: 2, d: 28 })
    expect(age(d('1990-11-22'), d('2026-11-22'))).toMatchObject({ years: 36, daysToBirthday: 0, turning: 36 })
    expect(() => age(d('2030-01-01'), d('2026-01-01'))).toThrow()
  })
})

describe('timestamp Unix', () => {
  it('detecta segundos o milisegundos', () => {
    expect(fromUnix(1700000000)).toEqual({ ms: 1700000000000, unit: 's' })
    expect(fromUnix(1700000000000)).toEqual({ ms: 1700000000000, unit: 'ms' })
  })
})

describe('husos horarios', () => {
  it('offsets conocidos', () => {
    const jan = Date.UTC(2026, 0, 15, 12)
    const jul = Date.UTC(2026, 6, 15, 12)
    expect(zoneOffsetMinutes(jan, 'America/Argentina/Buenos_Aires')).toBe(-180)
    expect(zoneOffsetMinutes(jan, 'Europe/Madrid')).toBe(60)
    expect(zoneOffsetMinutes(jul, 'Europe/Madrid')).toBe(120) // horario de verano
    expect(zoneOffsetMinutes(jan, 'Asia/Kolkata')).toBe(330)
    expect(formatOffset(-180)).toBe('UTC−3')
    expect(formatOffset(330)).toBe('UTC+5:30')
  })

  it('hora de pared → instante, y de vuelta en otro huso', () => {
    const ms = zonedToInstant(d('2026-07-15'), 10, 0, 'America/Argentina/Buenos_Aires')
    expect(ms).toBe(Date.UTC(2026, 6, 15, 13, 0))
    expect(wallTime(ms, 'Europe/Madrid')).toMatchObject({ h: 15, min: 0 })
    expect(wallTime(ms, 'Asia/Tokyo')).toMatchObject({ d: 15, h: 22 })
  })

  it('todas las ciudades tienen un huso válido', () => {
    for (const c of CITIES) expect(() => zoneOffsetMinutes(Date.now(), c.tz)).not.toThrow()
  })
})
