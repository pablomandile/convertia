<script setup lang="ts">
import { parseNumber, screenDensity } from '@convertia/core'

const width = ref('1920')
const height = ref('1080')
const diagonal = ref('24')

const PRESETS = [
  { label: 'Full HD 24″', w: 1920, h: 1080, d: 24 },
  { label: 'QHD 27″', w: 2560, h: 1440, d: 27 },
  { label: '4K 27″', w: 3840, h: 2160, d: 27 },
  { label: 'Notebook 15,6″', w: 1920, h: 1080, d: 15.6 },
  { label: 'TV 4K 55″', w: 3840, h: 2160, d: 55 },
  { label: 'Celular 6,1″', w: 1170, h: 2532, d: 6.1 },
]

function preset(p: typeof PRESETS[number]) {
  width.value = String(p.w)
  height.value = String(p.h)
  diagonal.value = String(p.d).replace('.', ',')
}

const result = computed(() => {
  const [w, h, d] = [width, height, diagonal].map(r => parseNumber(r.value))
  if (!w || !h || !d || d.isZero()) return undefined
  return screenDensity(Number(w.toString()), Number(h.toString()), Number(d.toString()))
})

const fmt = (n: number, digits = 1) => n.toLocaleString('es-AR', { maximumFractionDigits: digits })
</script>

<template>
  <ToolPage
    path="/diseno/ppi"
    seo-title="Calculadora de PPI y tamaño de pantalla"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in PRESETS"
          :key="p.label"
          type="button"
          class="rounded-full border border-slate-300 px-3 py-1 text-sm hover:border-brand-500 dark:border-slate-700"
          @click="preset(p)"
        >
          {{ p.label }}
        </button>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <NumberField
          v-model="width"
          label="Ancho"
          suffix="px"
        />
        <NumberField
          v-model="height"
          label="Alto"
          suffix="px"
        />
        <NumberField
          v-model="diagonal"
          label="Diagonal"
          suffix="″"
        />
      </div>
      <template v-if="result">
        <CopyField
          label="Densidad"
          :value="`${fmt(result.ppi)} PPI`"
          large
        />
        <dl class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Tamaño visible
            </dt>
            <dd class="mt-1 font-semibold tabular-nums">
              {{ fmt(result.widthCm) }} × {{ fmt(result.heightCm) }} cm
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Proporción
            </dt>
            <dd class="mt-1 font-semibold">
              {{ result.aspect }}
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Tamaño de píxel
            </dt>
            <dd class="mt-1 font-semibold tabular-nums">
              {{ fmt(result.dotPitchMm, 3) }} mm
            </dd>
          </div>
          <div class="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <dt class="text-slate-600 dark:text-slate-400">
              Megapíxeles
            </dt>
            <dd class="mt-1 font-semibold tabular-nums">
              {{ fmt(result.megapixels, 2) }} MP
            </dd>
          </div>
        </dl>
      </template>
    </section>
    <p class="text-sm text-slate-500">
      Como referencia: un monitor de escritorio se ve nítido desde unos 90–110 PPI, una notebook desde ~140 y un celular desde ~300 (a la distancia a la que se usa cada uno).
    </p>
  </ToolPage>
</template>
