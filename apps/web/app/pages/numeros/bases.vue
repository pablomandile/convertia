<script setup lang="ts">
import { formatInBase, groupDigits, parseInBase } from '@convertia/core'

const input = ref('255')
const base = ref(10)
const customBase = ref(36)

const BASES = [
  { value: 10, label: 'Decimal (10)' },
  { value: 2, label: 'Binario (2)' },
  { value: 8, label: 'Octal (8)' },
  { value: 16, label: 'Hexadecimal (16)' },
]

const parsed = computed<{ value: bigint } | { error: string } | null>(() => {
  if (!input.value.trim()) return null
  try {
    return { value: parseInBase(input.value, base.value) }
  }
  catch (error) {
    return { error: (error as Error).message }
  }
})

const outputs = computed(() => {
  const p = parsed.value
  if (!p || !('value' in p)) return []
  const v = p.value
  const custom = Math.min(36, Math.max(2, Math.trunc(customBase.value) || 2))
  return [
    { label: 'Decimal', raw: v.toString(), shown: groupDigits(v.toString(), 3, '.') },
    { label: 'Binario', raw: formatInBase(v, 2), shown: groupDigits(formatInBase(v, 2), 4) },
    { label: 'Octal', raw: formatInBase(v, 8), shown: formatInBase(v, 8) },
    { label: 'Hexadecimal', raw: formatInBase(v, 16), shown: groupDigits(formatInBase(v, 16), 2) },
    { label: `Base ${custom}`, raw: formatInBase(v, custom), shown: formatInBase(v, custom) },
  ]
})
</script>

<template>
  <ToolPage
    path="/numeros/bases"
    seo-title="Convertir binario, decimal y hexadecimal"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Número</span>
          <input
            v-model="input"
            type="text"
            autocomplete="off"
            spellcheck="false"
            class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-xl dark:border-slate-700 dark:bg-slate-900"
          >
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Está escrito en</span>
          <select
            v-model.number="base"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white py-3 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <option
              v-for="b in BASES"
              :key="b.value"
              :value="b.value"
            >
              {{ b.label }}
            </option>
          </select>
        </label>
      </div>

      <p
        v-if="parsed && 'error' in parsed"
        class="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        role="alert"
      >
        {{ parsed.error }}
      </p>

      <div
        v-if="outputs.length"
        class="grid gap-3"
      >
        <CopyField
          v-for="o in outputs"
          :key="o.label"
          :label="o.label"
          :value="o.shown"
          :copy-value="o.raw"
          mono
        />
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          Otra base:
          <input
            v-model.number="customBase"
            type="number"
            min="2"
            max="36"
            class="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-900"
          >
          (2 a 36)
        </label>
      </div>
    </section>

    <p class="text-sm text-slate-500">
      Funciona con enteros de cualquier tamaño, sin perder precisión. Podés pegar números con prefijo (<code>0x</code>, <code>0b</code>, <code>0o</code>), espacios o guiones bajos.
    </p>
  </ToolPage>
</template>
