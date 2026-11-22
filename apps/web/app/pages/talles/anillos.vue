<script setup lang="ts">
import { parseNumber, ringFromCircumference, ringFromDiameter, ringFromUS } from '@convertia/core'

const mode = ref<'diameter' | 'circumference' | 'us'>('diameter')
const value = ref('17.3')

const MODES = {
  diameter: { label: 'Diámetro interno', suffix: 'mm' },
  circumference: { label: 'Circunferencia interna', suffix: 'mm' },
  us: { label: 'Talle EE. UU.', suffix: '' },
} as const

const result = computed(() => {
  const n = parseNumber(value.value)
  if (!n) return undefined
  const v = Number(n.toString())
  const r = mode.value === 'diameter' ? ringFromDiameter(v) : mode.value === 'circumference' ? ringFromCircumference(v) : ringFromUS(v)
  return r.diameter >= 10 && r.diameter <= 30 ? r : undefined
})

const fmt = (n: number) => n.toLocaleString('es-AR')
const table = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(ringFromUS)
</script>

<template>
  <ToolPage
    path="/talles/anillos"
    seo-title="Talles de anillos: medida en mm y talle de EE. UU."
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div
        class="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Qué medida tenés"
      >
        <button
          v-for="(m, id) in MODES"
          :key="id"
          type="button"
          role="radio"
          :aria-checked="mode === id"
          class="rounded-full border px-3 py-1 text-sm"
          :class="mode === id ? 'border-brand-500 bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100' : 'border-slate-300 dark:border-slate-700'"
          @click="mode = id"
        >
          {{ m.label }}
        </button>
      </div>
      <NumberField
        v-model="value"
        :label="MODES[mode].label"
        :suffix="MODES[mode].suffix"
        large
      />
      <dl
        v-if="result"
        class="grid grid-cols-3 gap-2"
      >
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-sm text-slate-600 dark:text-slate-400">
            Diámetro
          </dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {{ fmt(result.diameter) }} mm
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-sm text-slate-600 dark:text-slate-400">
            Circunf. (ISO)
          </dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {{ fmt(result.circumference) }} mm
          </dd>
        </div>
        <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <dt class="text-sm text-slate-600 dark:text-slate-400">
            EE. UU.
          </dt>
          <dd class="mt-1 text-xl font-semibold tabular-nums">
            {{ fmt(result.us) }}
          </dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Tabla de talles
      </h2>
      <table class="mt-3 w-full overflow-hidden rounded-xl border border-slate-200 text-center text-sm tabular-nums dark:border-slate-800">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th class="px-2 py-2 font-medium">
              EE. UU.
            </th>
            <th class="px-2 py-2 font-medium">
              Diámetro (mm)
            </th>
            <th class="px-2 py-2 font-medium">
              Circunferencia (mm)
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="row in table"
            :key="row.us"
          >
            <td class="px-2 py-2">
              {{ row.us }}
            </td>
            <td class="px-2 py-2">
              {{ fmt(row.diameter) }}
            </td>
            <td class="px-2 py-2">
              {{ fmt(row.circumference) }}
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-3 text-sm text-slate-500">
        Para medirte: rodeá el dedo con un hilo, marcá donde se cruza y medí el largo en milímetros (esa es la circunferencia).
        O medí el diámetro interno de un anillo que te quede bien. En Europa el talle (ISO 8653) es la circunferencia en milímetros.
        En Argentina cada joyería usa su propia numeración: lo más seguro es llevar la medida en milímetros.
      </p>
    </section>
  </ToolPage>
</template>
