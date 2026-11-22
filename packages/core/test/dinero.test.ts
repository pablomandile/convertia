import { describe, expect, it } from 'vitest'
import {
  addVat, adjustForInflation, averageMonthlyInflation, compareInstallments, fixedTermDeposit,
  impliedMonthlyRate, inflationRates, presentValueOfInstallments, realReturnPct, removeVat,
} from '../src'
import type { IndexSeries } from '../src'

describe('IVA', () => {
  it('agrega y quita', () => {
    expect(addVat(1000, 21)).toEqual({ net: 1000, vat: 210, total: 1210 })
    expect(removeVat(1210, 21)).toEqual({ net: 1000, vat: 210, total: 1210 })
    expect(addVat(100, 10.5)).toEqual({ net: 100, vat: 10.5, total: 110.5 })
    expect(removeVat(100, 21)).toEqual({ net: 82.64, vat: 17.36, total: 100 })
  })
})

describe('inflación', () => {
  const series: IndexSeries = [['2025-01', 100], ['2025-02', 102], ['2025-03', 104.04], ['2025-04', 106.1208]]

  it('ajusta montos entre meses (en las dos direcciones)', () => {
    const r = adjustForInflation(1000, series, '2025-01', '2025-04')
    expect(r.amount).toBe(1061.21)
    expect(r.cumulativePct).toBeCloseTo(6.1208, 4)
    expect(adjustForInflation(1061.21, series, '2025-04', '2025-01').amount).toBe(1000)
  })

  it('variación mensual, interanual y promedio', () => {
    expect(inflationRates(series).monthlyPct).toBeCloseTo(2, 6)
    expect(inflationRates(series).yearlyPct).toBeUndefined()
    expect(averageMonthlyInflation(series, 3)).toBeCloseTo(2, 6)
  })

  it('avisa si falta el mes', () => {
    expect(() => adjustForInflation(1, series, '2020-01', '2025-01')).toThrow(/2020-01/)
  })
})

describe('cuotas vs. contado', () => {
  it('valor presente', () => {
    expect(presentValueOfInstallments(100, 3, 0)).toBe(300)
    expect(presentValueOfInstallments(110, 1, 10)).toBeCloseTo(100, 10)
    expect(presentValueOfInstallments(100, 2, 10, true)).toBeCloseTo(100 + 100 / 1.1, 10)
  })

  it('tasa implícita', () => {
    expect(impliedMonthlyRate(300, 100, 3)).toBeCloseTo(0, 6)
    expect(impliedMonthlyRate(100, 110, 1)).toBeCloseTo(10, 6)
  })

  it('cuotas sin interés con inflación: conviene cuotas', () => {
    const r = compareInstallments({ cashPrice: 120000, installment: 20000, n: 6, monthlyInflationPct: 3 })
    expect(r.better).toBe('cuotas')
    expect(r.total).toBe(120000)
    expect(r.surchargePct).toBeCloseTo(0, 10)
    expect(r.savings).toBeGreaterThan(0)
  })

  it('descuento de contado grande: conviene contado', () => {
    const r = compareInstallments({ cashPrice: 80000, installment: 20000, n: 6, monthlyInflationPct: 2 })
    expect(r.better).toBe('contado')
    expect(r.surchargePct).toBeCloseTo(50, 10)
    expect(r.monthlyRatePct).toBeGreaterThan(2)
  })
})

describe('plazo fijo', () => {
  it('interés simple, año de 365 días', () => {
    const r = fixedTermDeposit(1000000, 36.5, 30)
    expect(r.interest).toBe(30000)
    expect(r.total).toBe(1030000)
    expect(r.periodPct).toBeCloseTo(3, 10)
    expect(r.monthlyPct).toBeCloseTo(3, 10)
    expect(r.teaPct).toBeCloseTo((1.03 ** (365 / 30) - 1) * 100, 8)
  })

  it('rendimiento real', () => {
    expect(realReturnPct(3, 3)).toBeCloseTo(0, 10)
    expect(realReturnPct(2, 3)).toBeLessThan(0)
  })
})
