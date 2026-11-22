<script setup lang="ts">
import { addVat, parseNumber, removeVat, VAT_RATES } from '@convertia/core'

const amount = ref('1000')
const rate = ref<number>(21)
const mode = ref<'sumar' | 'quitar'>('sumar')

const result = computed(() => {
  const n = parseNumber(amount.value)
  if (!n) return undefined
  const value = Number(n.toString())
  return mode.value === 'sumar' ? addVat(value, rate.value) : removeVat(value, rate.value)
})

const RATE_NOTES: Record<number, string> = {
  21: 'General',
  10.5: 'Reducida (alimentos básicos, medicina prepaga, obras…)',
  27: 'Servicios públicos a empresas (luz, gas, agua, telecomunicaciones)',
  5: 'Diarios y revistas (ventas mayores)',
  2.5: 'Diarios y revistas (ventas menores)',
}
</script>

<template>
  <ToolPage
    path="/iva"
    seo-title="Calculadora de IVA (21 %, 10,5 % y 27 %)"
  >
    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <div
        class="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
        role="radiogroup"
        aria-label="Operación"
      >
        <button
          type="button"
          role="radio"
          :aria-checked="mode === 'sumar'"
          class="rounded-md px-3 py-1.5 text-sm font-medium"
          :class="mode === 'sumar' ? 'bg-brand-700 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="mode = 'sumar'"
        >
          Sumar IVA
        </button>
        <button
          type="button"
          role="radio"
          :aria-checked="mode === 'quitar'"
          class="rounded-md px-3 py-1.5 text-sm font-medium"
          :class="mode === 'quitar' ? 'bg-brand-700 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="mode = 'quitar'"
        >
          Quitar IVA
        </button>
      </div>

      <NumberField
        v-model="amount"
        :label="mode === 'sumar' ? 'Precio sin IVA (neto)' : 'Precio con IVA (final)'"
        prefix="$"
        large
      />

      <fieldset>
        <legend class="text-sm font-medium text-slate-600 dark:text-slate-400">
          Alícuota
        </legend>
        <div class="mt-1 flex flex-wrap gap-2">
          <label
            v-for="r in VAT_RATES"
            :key="r"
            class="cursor-pointer rounded-full border border-slate-300 px-3 py-1 text-sm has-checked:border-brand-500 has-checked:bg-brand-50 has-checked:text-brand-900 has-focus-visible:ring-2 has-focus-visible:ring-brand-500 dark:border-slate-700 dark:has-checked:bg-brand-900/30 dark:has-checked:text-brand-100"
            :title="RATE_NOTES[r]"
          >
            <input
              v-model.number="rate"
              type="radio"
              :value="r"
              class="sr-only"
            >
            {{ r.toLocaleString('es-AR') }} %
          </label>
        </div>
        <p class="mt-1 text-xs text-slate-500">
          {{ RATE_NOTES[rate] }}
        </p>
      </fieldset>
    </section>

    <section
      v-if="result"
      class="grid gap-3 sm:grid-cols-3"
    >
      <CopyField
        label="Neto"
        :value="formatPesos(result.net)"
      />
      <CopyField
        :label="`IVA ${rate.toLocaleString('es-AR')} %`"
        :value="formatPesos(result.vat)"
      />
      <CopyField
        label="Total"
        :value="formatPesos(result.total)"
      />
    </section>
  </ToolPage>
</template>
