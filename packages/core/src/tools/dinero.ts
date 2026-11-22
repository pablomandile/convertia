// Cálculos de dinero: IVA, inflación con el IPC, cuotas vs. contado y plazo fijo.
// Son estimaciones para decidir, no liquidaciones: se trabaja en coma flotante y se redondea a centavos.

const cents = (n: number) => Math.round(n * 100) / 100

// --- IVA ----------------------------------------------------------------------------

export const VAT_RATES = [21, 10.5, 27, 5, 2.5] as const

/** Desde el precio neto (sin IVA). */
export function addVat(net: number, ratePct: number) {
  const vat = net * ratePct / 100
  return { net: cents(net), vat: cents(vat), total: cents(net + vat) }
}

/** Desde el precio final (con IVA incluido). */
export function removeVat(total: number, ratePct: number) {
  const net = total / (1 + ratePct / 100)
  return { net: cents(net), vat: cents(total - net), total: cents(total) }
}

// --- Inflación ----------------------------------------------------------------------

/** Serie mensual: [["2016-12", 100], ["2017-01", 101.59], …] (formato de /api/v1/ipc.json). */
export type IndexSeries = Array<[string, number]>

export function indexAt(series: IndexSeries, month: string): number | undefined {
  return series.find(([m]) => m === month)?.[1]
}

/**
 * Cuánto vale hoy (mes `to`) un monto del mes `from`, y la inflación acumulada entre los dos.
 * Funciona en las dos direcciones: si `to` es anterior, "deflacta".
 */
export function adjustForInflation(amount: number, series: IndexSeries, from: string, to: string) {
  const a = indexAt(series, from)
  const b = indexAt(series, to)
  if (a === undefined) throw new RangeError(`No hay dato de IPC para ${from}`)
  if (b === undefined) throw new RangeError(`No hay dato de IPC para ${to}`)
  const factor = b / a
  return { amount: cents(amount * factor), factor, cumulativePct: (factor - 1) * 100 }
}

/** Variación mensual e interanual del último mes (o del mes pedido). */
export function inflationRates(series: IndexSeries, month?: string) {
  const i = month ? series.findIndex(([m]) => m === month) : series.length - 1
  if (i < 0) throw new RangeError(`No hay dato de IPC para ${month}`)
  const [m, v] = series[i]!
  const prev = series[i - 1]?.[1]
  const yearAgo = series[i - 12]?.[1]
  return {
    month: m,
    monthlyPct: prev ? (v / prev - 1) * 100 : undefined,
    yearlyPct: yearAgo ? (v / yearAgo - 1) * 100 : undefined,
  }
}

/** Promedio geométrico mensual de los últimos `months` meses (para proyectar). */
export function averageMonthlyInflation(series: IndexSeries, months = 3): number | undefined {
  if (series.length <= months) return undefined
  const last = series.at(-1)![1]
  const base = series.at(-1 - months)![1]
  return ((last / base) ** (1 / months) - 1) * 100
}

// --- Cuotas vs. contado ---------------------------------------------------------------

/**
 * Valor presente de `n` cuotas iguales descontadas a una tasa mensual (la inflación esperada).
 * `firstNow`: la primera cuota se paga hoy (en el acto) y no el mes que viene.
 */
export function presentValueOfInstallments(installment: number, n: number, monthlyRatePct: number, firstNow = false): number {
  const r = monthlyRatePct / 100
  let pv = 0
  for (let k = 0; k < n; k++) {
    const period = firstNow ? k : k + 1
    pv += installment / (1 + r) ** period
  }
  return pv
}

/**
 * Tasa mensual implícita de un plan en cuotas respecto del precio de contado (la TIR),
 * por bisección. Devuelve 0 si las cuotas suman lo mismo que el contado y negativa si suman menos.
 */
export function impliedMonthlyRate(cashPrice: number, installment: number, n: number, firstNow = false): number {
  const f = (r: number) => presentValueOfInstallments(installment, n, r, firstNow) - cashPrice
  let lo = -99
  let hi = 1000
  if (f(lo) * f(hi) > 0) return Number.NaN
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (f(mid) > 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export function compareInstallments(input: {
  cashPrice: number
  installment: number
  n: number
  monthlyInflationPct: number
  firstNow?: boolean
}) {
  const { cashPrice, installment, n, monthlyInflationPct, firstNow = false } = input
  const total = installment * n
  const presentValue = presentValueOfInstallments(installment, n, monthlyInflationPct, firstNow)
  const monthlyRate = impliedMonthlyRate(cashPrice, installment, n, firstNow)
  return {
    total: cents(total),
    surchargePct: (total / cashPrice - 1) * 100,
    presentValue: cents(presentValue),
    /** Positivo: las cuotas, traídas a hoy, cuestan menos que pagar de contado. */
    savings: cents(cashPrice - presentValue),
    better: presentValue < cashPrice ? 'cuotas' as const : presentValue > cashPrice ? 'contado' as const : 'igual' as const,
    monthlyRatePct: monthlyRate,
    tnaPct: monthlyRate * 12,
    teaPct: ((1 + monthlyRate / 100) ** 12 - 1) * 100,
  }
}

// --- Plazo fijo -----------------------------------------------------------------------

/** Plazo fijo tradicional: interés simple sobre año de 365 días (como liquidan los bancos argentinos). */
export function fixedTermDeposit(capital: number, tnaPct: number, days: number) {
  const interest = capital * tnaPct / 100 * days / 365
  const periodRate = tnaPct / 100 * days / 365
  return {
    interest: cents(interest),
    total: cents(capital + interest),
    /** Tasa efectiva del período y anual si se renueva siempre al mismo plazo. */
    periodPct: periodRate * 100,
    teaPct: ((1 + periodRate) ** (365 / days) - 1) * 100,
    /** Equivalente mensual (30 días) compuesto, para comparar con la inflación mensual. */
    monthlyPct: ((1 + periodRate) ** (30 / days) - 1) * 100,
  }
}

/** Rendimiento real: cuánto le ganó (o perdió) a la inflación en el mismo período. */
export function realReturnPct(nominalPct: number, inflationPct: number): number {
  return ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100
}
