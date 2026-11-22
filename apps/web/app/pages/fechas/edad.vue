<script setup lang="ts">
import { age, parseISODate } from '@convertia/core'

const birth = ref('1990-05-15')
const today = ref('')
onMounted(() => (today.value = todayISO()))

const result = computed(() => {
  const b = parseISODate(birth.value)
  const t = parseISODate(today.value)
  if (!b || !t) return undefined
  try {
    return age(b, t)
  }
  catch {
    return null
  }
})
</script>

<template>
  <ToolPage
    path="/fechas/edad"
    seo-title="Calculadora de edad exacta"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <label class="block">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Fecha de nacimiento</span>
        <input
          v-model="birth"
          type="date"
          class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-lg dark:border-slate-700 dark:bg-slate-900 dark:scheme-dark"
        >
      </label>
      <template v-if="result">
        <CopyField
          label="Edad"
          :value="ymdText(result.years, result.months, result.days)"
          large
        />
        <dl class="grid grid-cols-2 gap-2 text-sm">
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Días vividos
            </dt>
            <dd class="mt-1 text-lg font-semibold tabular-nums">
              {{ result.totalDays.toLocaleString('es-AR') }}
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Naciste un
            </dt>
            <dd class="mt-1 text-lg font-semibold">
              {{ WEEKDAYS[result.bornWeekday] }}
            </dd>
          </div>
        </dl>
        <p class="rounded-xl bg-brand-50 p-4 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100">
          <template v-if="result.daysToBirthday === 0">
            🎉 ¡Hoy cumplís {{ result.turning }}!
          </template>
          <template v-else>
            Faltan <strong>{{ plural(result.daysToBirthday, 'día') }}</strong> para tu cumpleaños número {{ result.turning }}
            ({{ longDate(result.nextBirthday) }}).
          </template>
        </p>
      </template>
      <p
        v-else-if="result === null"
        class="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        role="alert"
      >
        La fecha de nacimiento es posterior a hoy.
      </p>
    </section>
  </ToolPage>
</template>
