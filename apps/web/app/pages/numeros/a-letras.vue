<script setup lang="ts">
import { amountToWords, integerToWords, parseNumber } from '@convertia/core'

const input = ref('1234,50')
const mode = ref<'monto' | 'numero'>('monto')
const currency = ref('ARS')
const style = ref<'fraccion' | 'centavos'>('fraccion')
const upper = ref(false)

const CURRENCIES: Record<string, { singular: string, plural: string, label: string }> = {
  ARS: { singular: 'peso', plural: 'pesos', label: 'Pesos' },
  USD: { singular: 'dólar', plural: 'dólares', label: 'Dólares' },
  EUR: { singular: 'euro', plural: 'euros', label: 'Euros' },
  UYU: { singular: 'peso uruguayo', plural: 'pesos uruguayos', label: 'Pesos uruguayos' },
  BRL: { singular: 'real', plural: 'reales', label: 'Reales' },
}

const result = computed<{ text: string } | { error: string } | null>(() => {
  const n = parseNumber(input.value)
  if (!input.value.trim()) return null
  if (!n) return { error: 'No es un número válido' }
  try {
    let text: string
    if (mode.value === 'monto') {
      text = amountToWords(n.toFixed(2), CURRENCIES[currency.value], style.value)
    }
    else {
      if (!n.isInteger()) return { error: 'Para escribir un número usá un entero (para decimales, elegí «Monto»)' }
      const words = integerToWords(BigInt(n.toFixed(0)))
      text = words.charAt(0).toUpperCase() + words.slice(1)
    }
    return { text: upper.value ? text.toLocaleUpperCase('es-AR') : text }
  }
  catch (error) {
    return { error: (error as Error).message }
  }
})
</script>

<template>
  <ToolPage
    path="/numeros/a-letras"
    seo-title="Número a letras para cheques y facturas"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div
        class="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
        role="radiogroup"
        aria-label="Qué convertir"
      >
        <button
          v-for="m in (['monto', 'numero'] as const)"
          :key="m"
          type="button"
          role="radio"
          :aria-checked="mode === m"
          class="rounded-md px-3 py-1.5 text-sm font-medium"
          :class="mode === m ? 'bg-brand-700 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="mode = m"
        >
          {{ m === 'monto' ? 'Monto' : 'Número' }}
        </button>
      </div>

      <label class="block">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ mode === 'monto' ? 'Monto' : 'Número' }}</span>
        <input
          v-model="input"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-2xl font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-900"
        >
      </label>

      <div
        v-if="mode === 'monto'"
        class="grid gap-3 sm:grid-cols-2"
      >
        <label class="block">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Moneda</span>
          <select
            v-model="currency"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <option
              v-for="(c, code) in CURRENCIES"
              :key="code"
              :value="code"
            >
              {{ c.label }}
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Centavos</span>
          <select
            v-model="style"
            class="mt-1 w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-8 pl-3 dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="fraccion">
              Con 50/100 (cheques)
            </option>
            <option value="centavos">
              Con cincuenta centavos
            </option>
          </select>
        </label>
      </div>

      <label class="flex items-center gap-2 text-sm">
        <input
          v-model="upper"
          type="checkbox"
          class="size-4 accent-brand-700"
        >
        Todo en mayúsculas
      </label>

      <CopyField
        v-if="result && 'text' in result"
        label="En letras"
        :value="result.text"
      />
      <p
        v-else-if="result"
        class="rounded-lg bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        role="alert"
      >
        {{ result.error }}
      </p>
    </section>

    <p class="text-sm text-slate-500">
      Usa la escala larga del español: mil millones = 1.000.000.000 y un billón = 1.000.000.000.000. Escribe «veintiún pesos» y «un millón de pesos», como corresponde delante de un sustantivo.
    </p>
  </ToolPage>
</template>
