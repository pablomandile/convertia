<script setup lang="ts">
import { parseNumber, SHOE_SYSTEMS, shoeSizes, type ShoeSystem } from '@convertia/core'

const system = ref<ShoeSystem>('ar')
const size = ref('40')

const result = computed(() => {
  const n = parseNumber(size.value)
  if (!n) return undefined
  const r = shoeSizes(system.value, Number(n.toString()))
  return r.cm >= 10 && r.cm <= 40 ? r : undefined
})

const fmt = (n: number) => n.toLocaleString('es-AR')
const table = [22, 23, 24, 25, 26, 27, 28, 29, 30].map(cm => shoeSizes('cm', cm))
</script>

<template>
  <ToolPage
    path="/talles/calzado"
    seo-title="Tabla de talles de calzado: Argentina, Europa y EE. UU."
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="grid grid-cols-2 gap-3">
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Sistema</span>
          <select
            v-model="system"
            class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white py-3 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <option
              v-for="s in SHOE_SYSTEMS"
              :key="s.id"
              :value="s.id"
            >
              {{ s.name }}
            </option>
          </select>
        </label>
        <NumberField
          v-model="size"
          :label="system === 'cm' ? 'Largo (cm)' : 'Talle'"
          large
        />
      </div>
      <dl
        v-if="result"
        class="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        <div
          v-for="s in SHOE_SYSTEMS"
          :key="s.id"
          class="rounded-xl border p-3"
          :class="s.id === system ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 dark:border-slate-800'"
        >
          <dt class="text-sm text-slate-600 dark:text-slate-400">
            {{ s.name }}
          </dt>
          <dd class="mt-1 text-2xl font-semibold tabular-nums">
            {{ fmt(result[s.id]) }}
          </dd>
        </div>
      </dl>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Tabla de equivalencias
      </h2>
      <div class="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table class="w-full text-center text-sm tabular-nums">
          <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th class="px-2 py-2 font-medium">
                Pie (cm)
              </th>
              <th class="px-2 py-2 font-medium">
                AR
              </th>
              <th class="px-2 py-2 font-medium">
                EU
              </th>
              <th class="px-2 py-2 font-medium">
                US H
              </th>
              <th class="px-2 py-2 font-medium">
                US M
              </th>
              <th class="px-2 py-2 font-medium">
                UK
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="row in table"
              :key="row.cm"
            >
              <td class="px-2 py-2">
                {{ fmt(row.cm) }}
              </td>
              <td class="px-2 py-2">
                {{ row.ar }}
              </td>
              <td class="px-2 py-2">
                {{ row.eu }}
              </td>
              <td class="px-2 py-2">
                {{ fmt(row.usm) }}
              </td>
              <td class="px-2 py-2">
                {{ fmt(row.usw) }}
              </td>
              <td class="px-2 py-2">
                {{ fmt(row.uk) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-sm text-slate-500">
        Equivalencias aproximadas: cada marca horma distinto, y en zapatillas suele variar medio número. Lo más confiable es medir el pie:
        apoyalo sobre un papel contra la pared, marcá la punta del dedo más largo y medí desde la pared, a la tarde (el pie se hincha durante el día).
      </p>
    </section>
  </ToolPage>
</template>
