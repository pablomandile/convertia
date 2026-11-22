<script setup lang="ts">
import { averageMonthlyInflation, compareInstallments, parseNumber } from '@convertia/core'

const { series, status } = useIpc()

const cash = ref('100000')
const n = ref('6')
const mode = ref<'cuota' | 'total'>('cuota')
const installmentText = ref('20000')
const totalText = ref('120000')
const inflation = ref('')
const firstNow = ref(false)

// Inflación esperada por defecto: promedio de los últimos 3 meses del IPC (editable).
const suggested = computed(() => series.value.length ? averageMonthlyInflation(series.value, 3) : undefined)
watch(suggested, (s) => {
  if (s !== undefined && !inflation.value) inflation.value = s.toLocaleString('es-AR', { maximumFractionDigits: 1 })
}, { immediate: true })
onMounted(() => {
  // Sin IPC (sin conexión y sin nada guardado), un valor razonable para no dejar el campo vacío.
  setTimeout(() => {
    if (!inflation.value) inflation.value = '2'
  }, 3000)
})

const num = (s: string) => {
  const d = parseNumber(s)
  return d ? Number(d.toString()) : Number.NaN
}

const result = computed(() => {
  const cashPrice = num(cash.value)
  const count = Math.trunc(num(n.value))
  const monthly = num(inflation.value)
  const installment = mode.value === 'cuota' ? num(installmentText.value) : num(totalText.value) / count
  if (!(cashPrice > 0) || !(count >= 1 && count <= 120) || !(installment > 0) || !Number.isFinite(monthly)) return undefined
  return { ...compareInstallments({ cashPrice, installment, n: count, monthlyInflationPct: monthly, firstNow: firstNow.value }), installment, count, monthly }
})
</script>

<template>
  <ToolPage
    path="/cuotas"
    seo-title="¿Cuotas o contado? Calculadora con inflación"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <NumberField
        v-model="cash"
        label="Precio de contado (con el descuento, si hay)"
        prefix="$"
        large
      />
      <div class="grid grid-cols-[6rem_1fr] gap-3">
        <NumberField
          v-model="n"
          label="Cuotas"
        />
        <div class="min-w-0">
          <div
            class="mb-1 flex gap-3 text-sm"
            role="radiogroup"
            aria-label="Cómo cargar el precio en cuotas"
          >
            <label class="flex items-center gap-1"><input
              v-model="mode"
              type="radio"
              value="cuota"
              class="accent-brand-700"
            > Valor de cada cuota</label>
            <label class="flex items-center gap-1"><input
              v-model="mode"
              type="radio"
              value="total"
              class="accent-brand-700"
            > Total</label>
          </div>
          <NumberField
            v-if="mode === 'cuota'"
            v-model="installmentText"
            label="Cuota"
            prefix="$"
          />
          <NumberField
            v-else
            v-model="totalText"
            label="Total en cuotas"
            prefix="$"
          />
        </div>
      </div>
      <NumberField
        v-model="inflation"
        label="Inflación mensual esperada"
        suffix="%"
        :hint="suggested !== undefined ? `Sugerida: promedio de los últimos 3 meses del IPC (${formatPct(suggested, 1)}).` : status === 'loading' ? 'Cargando el IPC…' : undefined"
      />
      <label class="flex items-center gap-2 text-sm">
        <input
          v-model="firstNow"
          type="checkbox"
          class="size-4 accent-brand-700"
        >
        La primera cuota se paga hoy
      </label>
    </section>

    <section
      v-if="result"
      class="space-y-3"
    >
      <div
        class="rounded-2xl p-4 sm:p-5"
        :class="result.better === 'cuotas' ? 'bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100' : result.better === 'contado' ? 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100' : 'bg-slate-100 dark:bg-slate-800'"
        aria-live="polite"
      >
        <p class="text-2xl font-bold">
          {{ result.better === 'cuotas' ? 'Conviene en cuotas' : result.better === 'contado' ? 'Conviene de contado' : 'Da lo mismo' }}
        </p>
        <p class="mt-1">
          <template v-if="result.better !== 'igual'">
            Las {{ result.count }} cuotas de {{ formatPesos(result.installment) }}, traídas a hoy con una inflación del {{ formatPct(result.monthly, 1) }} mensual,
            valen <strong>{{ formatPesos(result.presentValue) }}</strong>:
            {{ result.better === 'cuotas' ? 'te ahorrás' : 'pagás de más' }} <strong>{{ formatPesos(Math.abs(result.savings)) }}</strong> en pesos de hoy.
          </template>
          <template v-else>
            El valor de las cuotas traídas a hoy es igual al precio de contado.
          </template>
        </p>
      </div>
      <dl class="grid grid-cols-2 gap-2 text-sm">
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            Total en cuotas
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPesos(result.total) }}
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            Recargo sobre contado
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPct(result.surchargePct, 1) }}
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            Tasa mensual del plan
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPct(result.monthlyRatePct, 2) }}
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            TEA del plan
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPct(result.teaPct, 1) }}
          </dd>
        </div>
      </dl>
      <p class="text-sm text-slate-500">
        La regla: si la tasa mensual del plan es menor que la inflación esperada, conviene financiarse.
        Es una estimación: la inflación futura no se conoce, y los costos de la tarjeta (sellado, seguros) no están incluidos.
      </p>
    </section>
  </ToolPage>
</template>
