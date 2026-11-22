<script setup lang="ts">
import { dateDiff, parseISODate } from '@convertia/core'

// Las fechas por defecto dependen de "hoy": se completan en el navegador, no en el prerender.
const from = ref('')
const to = ref('')
onMounted(() => {
  to.value = todayISO()
  from.value = `${to.value.slice(0, 4)}-01-01`
})

const result = computed(() => {
  const a = parseISODate(from.value)
  const b = parseISODate(to.value)
  if (!a || !b) return undefined
  return { ...dateDiff(a, b), a, b }
})

const inputClass = 'mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-lg dark:border-slate-700 dark:bg-slate-900 dark:scheme-dark'
</script>

<template>
  <ToolPage
    path="/fechas/diferencia"
    seo-title="Calcular días entre dos fechas"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Desde</span>
          <input
            v-model="from"
            type="date"
            :class="inputClass"
          >
        </label>
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Hasta</span>
          <input
            v-model="to"
            type="date"
            :class="inputClass"
          >
        </label>
      </div>
      <template v-if="result">
        <CopyField
          label="Diferencia"
          :value="ymdText(result.years, result.months, result.days)"
          large
        />
        <p
          v-if="result.negative"
          class="text-sm text-amber-700 dark:text-amber-400"
        >
          La fecha «hasta» es anterior a «desde»: se muestra la distancia entre las dos.
        </p>
        <dl class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Días
            </dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums">
              {{ result.totalDays.toLocaleString('es-AR') }}
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Semanas
            </dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums">
              {{ result.totalWeeks.toLocaleString('es-AR') }}<span
                v-if="result.totalDays % 7"
                class="text-sm font-normal text-slate-500"
              > y {{ plural(result.totalDays % 7, 'día') }}</span>
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Meses
            </dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums">
              {{ result.totalMonths.toLocaleString('es-AR') }}
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Días hábiles
            </dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums">
              {{ result.businessDays.toLocaleString('es-AR') }}
            </dd>
          </div>
        </dl>
      </template>
    </section>
    <p class="text-sm text-slate-500">
      Se cuenta desde el primer día hasta el último sin incluirlo (del 1 al 2 de enero hay 1 día). Los días hábiles son de lunes a viernes, sin descontar feriados.
    </p>
  </ToolPage>
</template>
