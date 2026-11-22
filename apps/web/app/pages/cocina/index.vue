<script setup lang="ts">
import { convertIngredient, INGREDIENTS, KITCHEN_MEASURES, parseNumber } from '@convertia/core'

const amount = ref('1')
const ingredient = ref('harina')
const from = ref('taza')
const to = ref('g')

const result = computed(() => {
  const n = parseNumber(amount.value)
  if (!n) return undefined
  return convertIngredient(Number(n.toString()), from.value, to.value, ingredient.value)
})

const fmt = (n: number) => n.toLocaleString('es-AR', { maximumFractionDigits: n < 10 ? 2 : 0 })
const measureName = (id: string) => KITCHEN_MEASURES.find(m => m.id === id)!.name.toLowerCase()

function swap() {
  [from.value, to.value] = [to.value, from.value]
}

// Tabla de equivalencias: 1 taza, 1 cucharada y 1 cucharadita en gramos, para cada ingrediente.
const table = INGREDIENTS.map(i => ({
  name: i.name,
  taza: convertIngredient(1, 'taza', 'g', i.id),
  cda: convertIngredient(1, 'cda', 'g', i.id),
  cdita: convertIngredient(1, 'cdita', 'g', i.id),
}))

const selectClass = 'mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900'
</script>

<template>
  <ToolPage
    path="/cocina"
    seo-title="Tazas y cucharadas a gramos: harina, azúcar, manteca"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <label class="block">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Ingrediente</span>
        <select
          v-model="ingredient"
          :class="selectClass"
        >
          <option
            v-for="i in INGREDIENTS"
            :key="i.id"
            :value="i.id"
          >
            {{ i.name }}
          </option>
        </select>
      </label>
      <div class="grid gap-3 sm:grid-cols-[1fr_1fr_auto_1fr] sm:items-end">
        <NumberField
          v-model="amount"
          label="Cantidad"
          large
        />
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">De</span>
          <select
            v-model="from"
            :class="selectClass"
          >
            <option
              v-for="m in KITCHEN_MEASURES"
              :key="m.id"
              :value="m.id"
            >
              {{ m.name }}
            </option>
          </select>
        </label>
        <button
          type="button"
          class="justify-self-center rounded-full border border-slate-300 p-2.5 text-slate-600 hover:border-brand-500 sm:mb-0.5 dark:border-slate-700 dark:text-slate-300"
          aria-label="Invertir"
          @click="swap"
        >
          <AppIcon
            name="swap"
            class="sm:rotate-90"
          />
        </button>
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">A</span>
          <select
            v-model="to"
            :class="selectClass"
          >
            <option
              v-for="m in KITCHEN_MEASURES"
              :key="m.id"
              :value="m.id"
            >
              {{ m.name }}
            </option>
          </select>
        </label>
      </div>
      <CopyField
        :label="`En ${measureName(to)}`"
        :value="result !== undefined ? fmt(result) : ''"
        large
      />
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Equivalencias en gramos
      </h2>
      <div class="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th class="px-3 py-2 font-medium">
                Ingrediente
              </th>
              <th class="px-3 py-2 text-right font-medium">
                1 taza
              </th>
              <th class="px-3 py-2 text-right font-medium">
                1 cda
              </th>
              <th class="px-3 py-2 text-right font-medium">
                1 cdita
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 tabular-nums dark:divide-slate-800">
            <tr
              v-for="row in table"
              :key="row.name"
            >
              <td class="px-3 py-2">
                {{ row.name }}
              </td>
              <td class="px-3 py-2 text-right">
                {{ Math.round(row.taza) }} g
              </td>
              <td class="px-3 py-2 text-right">
                {{ fmt(row.cda) }} g
              </td>
              <td class="px-3 py-2 text-right">
                {{ fmt(row.cdita) }} g
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-sm text-slate-500">
        Valores orientativos con taza de 250 ml, cucharada de 15 ml y cucharadita de 5 ml, ingredientes secos cargados con cuchara y enrasados.
        La harina tamizada pesa menos, y la compactada, más. Para recetas de EE. UU., elegí «Taza EE. UU.».
      </p>
    </section>
  </ToolPage>
</template>
