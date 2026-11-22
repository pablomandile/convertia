<script setup lang="ts">
import { oven, OVEN_TABLE, parseNumber } from '@convertia/core'

const value = ref('180')
const unit = ref<'C' | 'F'>('C')

const result = computed(() => {
  const n = parseNumber(value.value)
  if (!n) return undefined
  const v = Number(n.toString())
  const celsius = unit.value === 'C' ? v : Math.round((v - 32) * 5 / 9)
  if (celsius < 30 || celsius > 350) return undefined
  return oven(celsius)
})
</script>

<template>
  <ToolPage
    path="/cocina/horno"
    seo-title="Temperaturas del horno: °C, °F y marca de gas"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="grid grid-cols-[1fr_auto] items-end gap-3">
        <NumberField
          v-model="value"
          label="Temperatura"
          large
        />
        <div
          class="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
          role="radiogroup"
          aria-label="Unidad"
        >
          <button
            v-for="u in (['C', 'F'] as const)"
            :key="u"
            type="button"
            role="radio"
            :aria-checked="unit === u"
            class="rounded-md px-4 py-2.5 font-medium"
            :class="unit === u ? 'bg-brand-700 text-white' : 'text-slate-600 dark:text-slate-300'"
            @click="unit = u"
          >
            °{{ u }}
          </button>
        </div>
      </div>
      <div
        v-if="result"
        class="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <CopyField
          label="Celsius"
          :value="`${result.celsius} °C`"
        />
        <CopyField
          label="Fahrenheit"
          :value="`${result.fahrenheit} °F`"
        />
        <CopyField
          label="Con ventilador"
          :value="`${result.fan} °C`"
        />
        <CopyField
          label="Marca de gas"
          :value="result.gas ? String(result.gas) : '—'"
        />
      </div>
      <p
        v-if="result"
        class="text-lg"
      >
        Horno <strong>{{ result.label.toLowerCase() }}</strong>
      </p>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Tabla de temperaturas
      </h2>
      <table class="mt-3 w-full overflow-hidden rounded-xl border border-slate-200 text-left text-sm dark:border-slate-800">
        <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th class="px-3 py-2 font-medium">
              Horno
            </th>
            <th class="px-3 py-2 font-medium">
              °C
            </th>
            <th class="px-3 py-2 font-medium">
              °F
            </th>
            <th class="px-3 py-2 font-medium">
              Gas
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 tabular-nums dark:divide-slate-800">
          <tr
            v-for="row in OVEN_TABLE"
            :key="row.celsius"
          >
            <td class="px-3 py-2">
              {{ row.label }}
            </td>
            <td class="px-3 py-2">
              {{ row.celsius }}
            </td>
            <td class="px-3 py-2">
              {{ row.fahrenheit }}
            </td>
            <td class="px-3 py-2">
              {{ row.gas }}
            </td>
          </tr>
        </tbody>
      </table>
      <p class="mt-3 text-sm text-slate-500">
        En hornos con ventilador (convección) se usa unos 20 °C menos para el mismo resultado. Los hornos de cocina varían: si podés, usá un termómetro de horno.
      </p>
    </section>
  </ToolPage>
</template>
