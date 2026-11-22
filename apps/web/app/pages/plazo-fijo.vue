<script setup lang="ts">
import { averageMonthlyInflation, fixedTermDeposit, parseNumber, realReturnPct } from '@convertia/core'

const { series } = useIpc()

const capital = ref('1000000')
const tna = ref('30')
const days = ref('30')

const num = (s: string) => {
  const d = parseNumber(s)
  return d ? Number(d.toString()) : Number.NaN
}

const result = computed(() => {
  const c = num(capital.value)
  const rate = num(tna.value)
  const d = Math.trunc(num(days.value))
  if (!(c > 0) || !(rate >= 0) || !(d >= 1 && d <= 3650)) return undefined
  return { ...fixedTermDeposit(c, rate, d), days: d }
})

const monthlyInflation = computed(() => series.value.length ? averageMonthlyInflation(series.value, 3) : undefined)
const real = computed(() => result.value && monthlyInflation.value !== undefined ? realReturnPct(result.value.monthlyPct, monthlyInflation.value) : undefined)

const dueDate = computed(() => {
  if (!result.value) return ''
  const d = new Date()
  d.setDate(d.getDate() + result.value.days)
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
})
</script>

<template>
  <ToolPage
    path="/plazo-fijo"
    seo-title="Calculadora de plazo fijo"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <NumberField
        v-model="capital"
        label="Capital"
        prefix="$"
        large
      />
      <div class="grid grid-cols-2 gap-3">
        <NumberField
          v-model="tna"
          label="TNA"
          suffix="%"
          hint="La tasa nominal anual que ofrece el banco."
        />
        <NumberField
          v-model="days"
          label="Plazo"
          suffix="días"
        />
      </div>
    </section>

    <section
      v-if="result"
      class="space-y-3"
    >
      <div class="grid gap-3 sm:grid-cols-2">
        <CopyField
          label="Interés ganado"
          :value="formatPesos(result.interest)"
          large
        />
        <CopyField
          label="Total al vencimiento"
          :value="formatPesos(result.total)"
          large
        />
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Vence el {{ dueDate }} (si cae en día no hábil, se paga el siguiente hábil).
      </p>
      <dl class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            Rendimiento del período
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPct(result.periodPct) }}
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            Equivalente mensual
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPct(result.monthlyPct) }}
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-slate-600 dark:text-slate-400">
            TEA (renovando)
          </dt>
          <dd class="mt-1 text-lg font-semibold tabular-nums">
            {{ formatPct(result.teaPct) }}
          </dd>
        </div>
      </dl>
      <div
        v-if="real !== undefined"
        class="rounded-2xl p-4"
        :class="real >= 0 ? 'bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100' : 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100'"
      >
        <p class="font-semibold">
          {{ real >= 0 ? 'Le gana a la inflación' : 'Pierde contra la inflación' }}: {{ formatPct(real, 2, true) }} real por mes
        </p>
        <p class="mt-1 text-sm">
          Comparado con la inflación promedio de los últimos 3 meses ({{ formatPct(monthlyInflation, 1) }} mensual, IPC del INDEC).
        </p>
      </div>
    </section>

    <p class="text-sm text-slate-500">
      Cálculo de plazo fijo tradicional: interés simple con año de 365 días, como liquidan los bancos en Argentina. No incluye impuestos.
    </p>
  </ToolPage>
</template>
