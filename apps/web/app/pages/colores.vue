<script setup lang="ts">
import { contrastRatio, parseColor, rgbToCmyk, rgbToHsl, toHex, wcag } from '@convertia/core'

const input = ref('#0f766e')
const color = computed(() => parseColor(input.value))

// El selector nativo trabaja con #rrggbb.
const picker = computed({
  get: () => color.value ? toHex({ ...color.value, a: 1 }) : '#000000',
  set: (v: string) => (input.value = v),
})

const formats = computed(() => {
  const c = color.value
  if (!c) return []
  const hsl = rgbToHsl(c)
  const cmyk = rgbToCmyk(c)
  const alpha = c.a < 1 ? ` / ${Math.round(c.a * 100)}%` : ''
  return [
    { label: 'HEX', value: toHex(c) },
    { label: 'RGB', value: `rgb(${c.r} ${c.g} ${c.b}${alpha})` },
    { label: 'HSL', value: `hsl(${hsl.h} ${hsl.s}% ${hsl.l}%${alpha})` },
    { label: 'CMYK (aprox.)', value: `${cmyk.c}% ${cmyk.m}% ${cmyk.y}% ${cmyk.k}%` },
  ]
})

const WHITE = { r: 255, g: 255, b: 255 }
const BLACK = { r: 0, g: 0, b: 0 }
const contrast = computed(() => {
  const c = color.value
  if (!c) return []
  return [
    { label: 'Texto blanco', fg: '#ffffff', ratio: contrastRatio(c, WHITE) },
    { label: 'Texto negro', fg: '#000000', ratio: contrastRatio(c, BLACK) },
  ].map(x => ({ ...x, level: wcag(x.ratio) }))
})

const swatch = computed(() => color.value ? toHex(color.value) : 'transparent')
</script>

<template>
  <ToolPage
    path="/colores"
    seo-title="Conversor de colores HEX, RGB, HSL y CMYK"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="flex items-end gap-3">
        <label class="block min-w-0 flex-1">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Color (HEX, rgb() o hsl())</span>
          <input
            v-model="input"
            type="text"
            autocomplete="off"
            spellcheck="false"
            class="mt-1 w-full min-w-0 rounded-lg border bg-white px-3 py-2.5 font-mono text-lg dark:bg-slate-900"
            :class="color ? 'border-slate-300 dark:border-slate-700' : 'border-red-400'"
          >
        </label>
        <label class="shrink-0">
          <span class="sr-only">Elegir color</span>
          <input
            v-model="picker"
            type="color"
            class="h-12 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          >
        </label>
      </div>
      <div
        class="h-20 rounded-xl border border-slate-200 dark:border-slate-700"
        :style="{ background: swatch }"
        aria-hidden="true"
      />
      <div
        v-if="formats.length"
        class="grid gap-3 sm:grid-cols-2"
      >
        <CopyField
          v-for="f in formats"
          :key="f.label"
          :label="f.label"
          :value="f.value"
          mono
        />
      </div>
      <p
        v-else
        class="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        role="alert"
      >
        No reconozco ese color. Probá con #0f766e, rgb(15 118 110) o hsl(175 77% 26%).
      </p>
    </section>

    <section v-if="contrast.length">
      <h2 class="text-lg font-semibold">
        Contraste para leer (WCAG)
      </h2>
      <div class="mt-3 grid gap-2 sm:grid-cols-2">
        <div
          v-for="c in contrast"
          :key="c.label"
          class="rounded-xl p-4"
          :style="{ background: swatch, color: c.fg }"
        >
          <p class="text-lg font-semibold">
            {{ c.label }} — {{ c.ratio.toLocaleString('es-AR', { maximumFractionDigits: 2 }) }}:1
          </p>
          <p class="text-sm">
            Texto normal: {{ c.level.normal }} · Texto grande: {{ c.level.large }}
          </p>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-500">
        AA pide al menos 4,5:1 para texto normal y 3:1 para texto grande; AAA, 7:1 y 4,5:1.
        El CMYK es una conversión directa, sin perfil de color: para imprenta, pedí la prueba de color.
      </p>
    </section>
  </ToolPage>
</template>
