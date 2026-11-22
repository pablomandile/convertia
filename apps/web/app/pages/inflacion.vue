<script setup lang="ts">
import { adjustForInflation, inflationRates, parseNumber } from '@convertia/core'

const { series, lastMonth, status, data } = useIpc()

const amount = ref('10000')
const from = ref('2019-01')
const to = ref('')

// Al cargar la serie, el destino por defecto es el último mes publicado.
watch(lastMonth, (m) => {
  if (m && !to.value) to.value = m
}, { immediate: true })

const months = computed(() => [...series.value].reverse().map(([m]) => ({ value: m, label: monthLabel(m) })))

const result = computed(() => {
  const n = parseNumber(amount.value)
  if (!n || !series.value.length || !to.value) return undefined
  try {
    return adjustForInflation(Number(n.toString()), series.value, from.value, to.value)
  }
  catch {
    return undefined
  }
})

const latest = computed(() => series.value.length ? inflationRates(series.value) : undefined)

// Inflación de cada año calendario (diciembre contra diciembre), y el año en curso hasta el último mes.
const yearly = computed(() => {
  const s = series.value
  if (!s.length) return []
  const byMonth = new Map(s)
  const lastYear = Number(s.at(-1)![0].slice(0, 4))
  const rows: Array<{ year: number, pct: number, partial: boolean }> = []
  for (let y = 2017; y <= lastYear; y++) {
    const start = byMonth.get(`${y - 1}-12`)
    const end = byMonth.get(`${y}-12`) ?? (y === lastYear ? s.at(-1)![1] : undefined)
    if (start && end) rows.push({ year: y, pct: (end / start - 1) * 100, partial: !byMonth.has(`${y}-12`) })
  }
  return rows.reverse()
})
</script>

<template>
  <ToolPage
    path="/inflacion"
    seo-title="Calculadora de inflación Argentina (IPC INDEC)"
  >
    <p
      v-if="status === 'error' && !series.length"
      class="text-slate-600"
    >
      No se pudo cargar el IPC. Probá de nuevo con conexión.
    </p>
    <p
      v-else-if="!series.length"
      class="text-slate-500"
    >
      Cargando el IPC…
    </p>

    <template v-else>
      <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <NumberField
          v-model="amount"
          label="Monto"
          prefix="$"
          large
        />
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="block min-w-0">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">En</span>
            <select
              v-model="from"
              class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <option
                v-for="m in months"
                :key="m.value"
                :value="m.value"
              >
                {{ m.label }}
              </option>
            </select>
          </label>
          <label class="block min-w-0">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Equivalen en</span>
            <select
              v-model="to"
              class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <option
                v-for="m in months"
                :key="m.value"
                :value="m.value"
              >
                {{ m.label }}
              </option>
            </select>
          </label>
        </div>
        <template v-if="result">
          <CopyField
            label="Monto ajustado por inflación"
            :value="formatPesos(result.amount)"
            large
          />
          <p class="text-slate-700 dark:text-slate-300">
            Inflación acumulada: <strong>{{ formatPct(result.cumulativePct, 1) }}</strong>
            · los precios se multiplicaron por <strong>{{ result.factor.toLocaleString('es-AR', { maximumFractionDigits: 2 }) }}</strong>
          </p>
        </template>
      </section>

      <section
        v-if="latest"
        class="grid grid-cols-2 gap-2"
      >
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Mensual ({{ monthLabel(latest.month) }})
          </p>
          <p class="mt-1 text-xl font-semibold tabular-nums">
            {{ formatPct(latest.monthlyPct, 1) }}
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Interanual
          </p>
          <p class="mt-1 text-xl font-semibold tabular-nums">
            {{ formatPct(latest.yearlyPct, 1) }}
          </p>
        </div>
      </section>

      <section>
        <h2 class="text-lg font-semibold">
          Inflación por año
        </h2>
        <table class="mt-3 w-full overflow-hidden rounded-xl border border-slate-200 text-left dark:border-slate-800">
          <thead class="bg-slate-50 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th class="px-4 py-2 font-medium">
                Año
              </th>
              <th class="px-4 py-2 font-medium">
                Inflación (dic. a dic.)
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 tabular-nums dark:divide-slate-800">
            <tr
              v-for="row in yearly"
              :key="row.year"
            >
              <td class="px-4 py-2">
                {{ row.year }}<span
                  v-if="row.partial"
                  class="text-slate-500"
                > (hasta {{ monthLabel(lastMonth!).split(' de ')[0] }})</span>
              </td>
              <td class="px-4 py-2">
                {{ formatPct(row.pct, 1) }}
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>

    <p class="text-sm text-slate-500">
      Fuente: IPC Nacional del INDEC (base diciembre 2016 = 100), vía
      <a
        :href="data?.source.url ?? 'https://datos.gob.ar'"
        rel="noopener"
        class="underline"
      >datos.gob.ar</a>.
      La serie arranca en diciembre de 2016, cuando el INDEC empezó a medir el IPC nacional actual.
    </p>
  </ToolPage>
</template>
