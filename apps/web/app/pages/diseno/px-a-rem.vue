<script setup lang="ts">
import { convertCss, CSS_UNITS, parseNumber, type CssUnit } from '@convertia/core'

const value = ref('24')
const unit = ref<CssUnit>('px')
const base = ref('16')

const results = computed(() => {
  const n = parseNumber(value.value)
  const b = parseNumber(base.value)
  if (!n || !b || b.isZero()) return []
  const v = Number(n.toString())
  const bv = Number(b.toString())
  return CSS_UNITS.filter(u => u !== unit.value).map(u => ({
    unit: u,
    text: `${Number(convertCss(v, unit.value, u, bv).toFixed(4)).toString()}${u}`,
  }))
})

const table = [10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64].map(px => ({ px, rem: Number((px / 16).toFixed(4)) }))
</script>

<template>
  <ToolPage
    path="/diseno/px-a-rem"
    seo-title="Convertir px a rem (y em, pt, cm)"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="grid grid-cols-[1fr_auto] items-end gap-3">
        <NumberField
          v-model="value"
          label="Valor"
          large
        />
        <label class="block">
          <span class="sr-only">Unidad</span>
          <select
            v-model="unit"
            class="rounded-lg border border-slate-300 bg-white py-3.5 pr-8 pl-3 font-mono dark:border-slate-700 dark:bg-slate-900"
          >
            <option
              v-for="u in CSS_UNITS"
              :key="u"
              :value="u"
            >
              {{ u }}
            </option>
          </select>
        </label>
      </div>
      <NumberField
        v-model="base"
        label="Tamaño de letra base (para rem, em y %)"
        suffix="px"
        hint="16 px es el valor por defecto de los navegadores."
      />
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CopyField
          v-for="r in results"
          :key="r.unit"
          :label="r.unit"
          :value="r.text"
          mono
        />
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Tabla px → rem (base 16 px)
      </h2>
      <div class="mt-3 grid grid-cols-3 gap-2 font-mono text-sm sm:grid-cols-4">
        <div
          v-for="row in table"
          :key="row.px"
          class="flex justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
        >
          <span class="text-slate-500">{{ row.px }}px</span><span>{{ row.rem }}rem</span>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-500">
        En CSS las medidas físicas son fijas: 1 in = 96 px = 2,54 cm y 1 pt = 1/72 in. No coinciden con el tamaño real en la pantalla, que depende de su densidad.
        «em» se calcula acá sobre la base; en la página depende del tamaño de letra del elemento padre.
      </p>
    </section>
  </ToolPage>
</template>
