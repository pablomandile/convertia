<script setup lang="ts">
import { fromRoman, toRoman } from '@convertia/core'

const input = ref('2026')

// Detecta solo la dirección: dígitos → romanos, letras → número.
const result = computed<{ ok: true, label: string, value: string } | { ok: false, error: string } | null>(() => {
  const text = input.value.trim().replace(/\./g, '')
  if (!text) return null
  try {
    if (/^\d+$/.test(text)) return { ok: true, label: 'En números romanos', value: toRoman(Number(text)) }
    return { ok: true, label: 'En números arábigos', value: String(fromRoman(text)) }
  }
  catch (error) {
    return { ok: false, error: (error as Error).message }
  }
})

const table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 40, 50, 90, 100, 400, 500, 900, 1000, 2026].map(n => ({ n, r: toRoman(n) }))
</script>

<template>
  <ToolPage
    path="/numeros/romanos"
    seo-title="Convertir números romanos"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <label class="block">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Escribí un número (1 a 3999) o un romano</span>
        <input
          v-model="input"
          type="text"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-2xl font-semibold uppercase dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <CopyField
        v-if="result?.ok"
        :label="result.label"
        :value="result.value"
        large
      />
      <p
        v-else-if="result && !result.ok"
        class="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        role="alert"
      >
        {{ result.error }}
      </p>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Tabla de números romanos
      </h2>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div
          v-for="row in table"
          :key="row.n"
          class="flex items-baseline justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
        >
          <span class="text-slate-500 tabular-nums">{{ row.n }}</span>
          <span class="font-semibold">{{ row.r }}</span>
        </div>
      </div>
      <p class="mt-3 text-sm text-slate-500">
        Reglas: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Una letra menor delante de una mayor resta (IV = 4, IX = 9), y ninguna se repite más de tres veces seguidas.
      </p>
    </section>
  </ToolPage>
</template>
