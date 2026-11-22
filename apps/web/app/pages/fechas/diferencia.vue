<script setup lang="ts">
import { dateDiff, parseISODate } from '@convertia/core'

// Las fechas por defecto dependen de "hoy": se completan en el navegador, no en el prerender.
const from = ref('')
const to = ref('')
onMounted(() => {
  to.value = todayISO()
  from.value = `${to.value.slice(0, 4)}-01-01`
})

const { data: feriadosData, years } = useFeriados()
// Los puentes turísticos son "no laborables": optativos para el sector privado (los bancos no abren).
const contarPuentes = ref(true)
const feriados = computed(() => new Set((feriadosData.value?.feriados ?? []).filter(f => contarPuentes.value || f.tipo !== 'puente').map(f => f.fecha)))

const result = computed(() => {
  const a = parseISODate(from.value)
  const b = parseISODate(to.value)
  if (!a || !b) return undefined
  return { ...dateDiff(a, b, feriados.value), a, b }
})

// Feriados nacionales que caen de lunes a viernes dentro del rango (los que se descontaron).
const feriadosEnRango = computed(() => {
  const r = result.value
  if (!r) return []
  const [start, end] = r.negative ? [to.value, from.value] : [from.value, to.value]
  return (feriadosData.value?.feriados ?? []).filter((f) => {
    const wd = new Date(`${f.fecha}T12:00:00Z`).getUTCDay()
    return feriados.value.has(f.fecha) && f.fecha >= start && f.fecha < end && wd !== 0 && wd !== 6
  })
})
// ¿El rango sale de los años con feriados cargados? Entonces esos años se cuentan sin feriados.
const fueraDeCobertura = computed(() => {
  if (!years.value.length || !from.value || !to.value) return false
  const [y1, y2] = [Number(from.value.slice(0, 4)), Number(to.value.slice(0, 4))].sort()
  return y1! < Math.min(...years.value) || y2! > Math.max(...years.value)
})
const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

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
        <label
          v-if="feriadosData"
          class="flex items-center gap-2 text-sm"
        >
          <input
            v-model="contarPuentes"
            type="checkbox"
            class="size-4 accent-brand-700"
          >
          Contar los puentes turísticos como no hábiles
        </label>
        <details
          v-if="feriadosEnRango.length"
          class="text-sm"
        >
          <summary class="cursor-pointer text-slate-600 dark:text-slate-400">
            Se descontaron {{ plural(feriadosEnRango.length, 'feriado') }} nacionales
          </summary>
          <ul class="mt-2 space-y-1">
            <li
              v-for="f in feriadosEnRango"
              :key="f.fecha"
              class="flex justify-between gap-3"
            >
              <span>{{ f.nombre }}</span>
              <span class="shrink-0 text-slate-500 tabular-nums">{{ shortDate(f.fecha) }}</span>
            </li>
          </ul>
        </details>
        <p
          v-if="fueraDeCobertura"
          class="text-sm text-amber-700 dark:text-amber-400"
        >
          Hay feriados cargados para {{ years.join(', ') }}: los días de otros años se cuentan de lunes a viernes.
        </p>
      </template>
    </section>
    <p class="text-sm text-slate-500">
      Se cuenta desde el primer día hasta el último sin incluirlo (del 1 al 2 de enero hay 1 día).
      Los días hábiles son de lunes a viernes, sin los feriados nacionales de Argentina (inamovibles, trasladables y, si lo dejás marcado, los puentes turísticos). No incluye feriados provinciales ni locales.
      <template v-if="feriadosData === null">
        No se pudieron cargar los feriados: se cuentan de lunes a viernes.
      </template>
      Fuente: <a
        href="https://argentinadatos.com"
        rel="noopener"
        class="underline"
      >ArgentinaDatos</a>.
    </p>
  </ToolPage>
</template>
