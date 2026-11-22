<script setup lang="ts">
import { PAPER_SIZES, paperPixels } from '@convertia/core'

const selected = ref('A4')
const dpi = ref(300)

const paper = computed(() => PAPER_SIZES.find(p => p.id === selected.value)!)
const px = computed(() => paperPixels(paper.value, dpi.value))
const fmt = (n: number, d = 1) => n.toLocaleString('es-AR', { maximumFractionDigits: d })
const inches = (mm: number) => fmt(mm / 25.4, 2)

const groups = [...new Set(PAPER_SIZES.map(p => p.group))].map(g => ({ g, items: PAPER_SIZES.filter(p => p.group === g) }))

// Vista previa proporcional (la hoja más grande de la lista entra en el recuadro).
const preview = computed(() => {
  const scale = 140 / Math.max(paper.value.w, paper.value.h)
  return { width: `${paper.value.w * scale}px`, height: `${paper.value.h * scale}px` }
})
</script>

<template>
  <ToolPage
    path="/papel"
    seo-title="Tamaños de papel: A4, oficio, carta en mm y píxeles"
  >
    <section class="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="min-w-0 space-y-3">
        <label class="block">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Tamaño</span>
          <select
            v-model="selected"
            class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <optgroup
              v-for="grp in groups"
              :key="grp.g"
              :label="grp.g"
            >
              <option
                v-for="p in grp.items"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </option>
            </optgroup>
          </select>
        </label>
        <CopyField
          label="Milímetros"
          :value="`${fmt(paper.w)} × ${fmt(paper.h)} mm`"
          large
        />
        <CopyField
          label="Pulgadas"
          :value="`${inches(paper.w)} × ${inches(paper.h)} in`"
        />
        <div class="flex items-end gap-2">
          <CopyField
            class="flex-1"
            :label="`Píxeles a ${dpi} ppp`"
            :value="`${px.w.toLocaleString('es-AR')} × ${px.h.toLocaleString('es-AR')} px`"
          />
          <select
            v-model.number="dpi"
            class="rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
            aria-label="Resolución"
          >
            <option :value="72">
              72 ppp
            </option>
            <option :value="150">
              150 ppp
            </option>
            <option :value="300">
              300 ppp
            </option>
            <option :value="600">
              600 ppp
            </option>
          </select>
        </div>
      </div>
      <div class="flex items-center justify-center p-2">
        <div
          class="rounded-sm border-2 border-slate-400 bg-white shadow-sm dark:border-slate-500 dark:bg-slate-200"
          :style="preview"
          aria-hidden="true"
        />
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Todos los tamaños
      </h2>
      <div class="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table class="w-full text-left text-sm tabular-nums">
          <thead class="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th class="px-3 py-2 font-medium">
                Tamaño
              </th>
              <th class="px-3 py-2 font-medium">
                mm
              </th>
              <th class="px-3 py-2 font-medium">
                Pulgadas
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="p in PAPER_SIZES"
              :key="p.id"
              class="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
              :class="p.id === selected && 'bg-brand-50/60 dark:bg-brand-900/20'"
              @click="selected = p.id"
            >
              <td class="px-3 py-2">
                {{ p.name }}
              </td>
              <td class="px-3 py-2">
                {{ fmt(p.w) }} × {{ fmt(p.h) }}
              </td>
              <td class="px-3 py-2">
                {{ inches(p.w) }} × {{ inches(p.h) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-sm text-slate-500">
        La serie A (ISO 216) es la de uso general: cada tamaño es la mitad del anterior y todos tienen la misma proporción (1 : √2). El oficio argentino (216 × 340 mm) no es igual al legal de EE. UU. (216 × 356 mm).
      </p>
    </section>
  </ToolPage>
</template>
