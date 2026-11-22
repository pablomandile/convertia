<script setup lang="ts">
import { formatQuantity, parseNumber, scaleRecipe } from '@convertia/core'

const recipe = ref(`250 g de harina 0000
150 g de azúcar
2 huevos
1/2 taza de leche
100 g de manteca
1 cdita de polvo de hornear
Horno a 180 °C por 40 minutos`)
const original = ref('4')
const wanted = ref('6')

const factor = computed(() => {
  const a = parseNumber(original.value)
  const b = parseNumber(wanted.value)
  if (!a || !b || a.isZero()) return undefined
  return Number(b.div(a).toString())
})

const scaled = computed(() => factor.value ? scaleRecipe(recipe.value, factor.value) : '')
const { copy } = useShare()
</script>

<template>
  <ToolPage
    path="/cocina/escalar-receta"
    seo-title="Escalar una receta: más o menos porciones"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="grid grid-cols-2 gap-3">
        <NumberField
          v-model="original"
          label="La receta rinde"
          suffix="porciones"
        />
        <NumberField
          v-model="wanted"
          label="Quiero"
          suffix="porciones"
        />
      </div>
      <p
        v-if="factor"
        class="text-sm text-slate-600 dark:text-slate-400"
      >
        Todo se multiplica por <strong>{{ formatQuantity(factor) }}</strong>.
      </p>
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Receta original (un ingrediente por línea)</span>
          <textarea
            v-model="recipe"
            rows="9"
            class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <div class="min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Receta ajustada</span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-brand-700 disabled:opacity-40 dark:hover:bg-slate-800"
              :disabled="!scaled"
              @click="copy(scaled, 'Receta copiada')"
            >
              <AppIcon
                name="copy"
                :size="14"
              /> Copiar
            </button>
          </div>
          <output
            class="mt-1 block min-h-[14rem] w-full rounded-lg bg-brand-50 px-3 py-2 whitespace-pre-wrap text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
            aria-live="polite"
          >{{ scaled }}</output>
        </div>
      </div>
    </section>
    <p class="text-sm text-slate-500">
      Se multiplica la primera cantidad de cada línea; las líneas de horno y tiempos quedan igual. Ojo con los huevos: si queda «1 ½», usá uno grande o batí dos y usá una parte.
      Los tiempos de cocción no escalan en proporción: con más masa, revisá un poco antes y seguí de a poco.
    </p>
  </ToolPage>
</template>
