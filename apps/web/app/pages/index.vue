<script setup lang="ts">
import { categories, convert, round } from '@convertia/core'

// Portada provisoria de la F0: comprueba que la app usa el motor de `core`.
// En la F1 se reemplaza por la barra inteligente y las categorías.
const categoryId = ref(categories[0]!.id)
const category = computed(() => categories.find(c => c.id === categoryId.value)!)

const amount = ref('1')
const from = ref(category.value.popular?.[0]?.[0] ?? category.value.units[0]!.id)
const to = ref(category.value.popular?.[0]?.[1] ?? category.value.units[1]!.id)

watch(categoryId, () => {
  from.value = category.value.popular?.[0]?.[0] ?? category.value.units[0]!.id
  to.value = category.value.popular?.[0]?.[1] ?? category.value.units[1]!.id
})

const nf = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 10 })

const result = computed(() => {
  const value = amount.value.replace(',', '.').trim()
  if (value === '' || Number.isNaN(Number(value))) return '—'
  return nf.format(round(convert(value, categoryId.value, from.value, to.value)))
})

function swap() {
  [from.value, to.value] = [to.value, from.value]
}
</script>

<template>
  <main class="mx-auto max-w-xl px-4 py-10">
    <h1 class="text-3xl font-bold text-brand-700 dark:text-brand-500">
      Convertia
    </h1>
    <p class="mt-1 text-slate-600 dark:text-slate-400">
      Convertí unidades, monedas y mucho más.
    </p>

    <section class="mt-8 space-y-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
      <label class="block">
        <span class="text-sm font-medium">Categoría</span>
        <select
          v-model="categoryId"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
        >
          <option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
          >
            {{ c.name.es }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="text-sm font-medium">Valor</span>
        <input
          v-model="amount"
          inputmode="decimal"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 text-lg dark:border-slate-700"
        >
      </label>

      <div class="flex items-end gap-2">
        <label class="block min-w-0 flex-1">
          <span class="text-sm font-medium">De</span>
          <select
            v-model="from"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
          >
            <option
              v-for="u in category.units"
              :key="u.id"
              :value="u.id"
            >
              {{ u.name.es }} ({{ u.symbol }})
            </option>
          </select>
        </label>
        <button
          type="button"
          class="rounded-lg border border-slate-300 p-2 dark:border-slate-700"
          aria-label="Invertir unidades"
          @click="swap"
        >
          ⇄
        </button>
        <label class="block min-w-0 flex-1">
          <span class="text-sm font-medium">A</span>
          <select
            v-model="to"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-transparent p-2 dark:border-slate-700"
          >
            <option
              v-for="u in category.units"
              :key="u.id"
              :value="u.id"
            >
              {{ u.name.es }} ({{ u.symbol }})
            </option>
          </select>
        </label>
      </div>

      <output
        class="block rounded-xl bg-brand-50 p-4 text-2xl font-semibold text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
        aria-live="polite"
      >
        {{ result }}
      </output>
    </section>
  </main>
</template>
