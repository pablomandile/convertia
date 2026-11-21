<script setup lang="ts">
import { parseNumber, type Decimal } from '@convertia/core'
import type { SavedConversion } from '~/composables/useSaved'

export interface ConverterOption {
  value: string
  label: string
  group?: string
}

/**
 * Conversor genérico (unidades o monedas): valor, origen, destino, resultado,
 * invertir, copiar, compartir y favorito. La página decide qué convierte y cómo se formatea.
 */
const props = defineProps<{
  options: ConverterOption[]
  convert: (value: Decimal, from: string, to: string) => Decimal | undefined
  format: (value: Decimal) => string
  symbol: (id: string) => string
  favorite: SavedConversion
  shareTitle: string
  /** Texto en lugar del resultado (por ejemplo «Cargando cotizaciones…»). */
  placeholder?: string
}>()

const from = defineModel<string>('from', { required: true })
const to = defineModel<string>('to', { required: true })
const value = defineModel<string>('value', { required: true })

const groups = computed(() => {
  const map = new Map<string, ConverterOption[]>()
  for (const option of props.options) {
    const key = option.group ?? ''
    map.set(key, [...(map.get(key) ?? []), option])
  }
  return [...map.entries()].map(([label, options]) => ({ label, options }))
})

const parsed = computed(() => parseNumber(value.value))
const result = computed(() => {
  if (props.placeholder || !parsed.value) return undefined
  try {
    return props.convert(parsed.value, from.value, to.value)
  }
  catch {
    return undefined // p. ej. división por cero en L/100 km = 0
  }
})
const resultText = computed(() => props.placeholder ?? (result.value ? props.format(result.value) : '—'))

function swap() {
  const previous = from.value
  from.value = to.value
  to.value = previous
}

const { has, toggle } = useFavorites()
const { copy, share } = useShare()
const route = useRoute()
const isFavorite = computed(() => has(props.favorite.key))

function shareResult() {
  if (!result.value || !parsed.value) return
  const text = `${props.format(parsed.value)} ${props.symbol(from.value)} = ${resultText.value} ${props.symbol(to.value)}`
  share(props.shareTitle, text, route.fullPath)
}

const selectClass = 'w-full min-w-0 truncate rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-base dark:border-slate-700 dark:bg-slate-900'
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
    <div class="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
      <!-- Origen -->
      <div class="min-w-0 space-y-2">
        <label
          for="conv-value"
          class="block text-sm font-medium text-slate-600 dark:text-slate-400"
        >Valor</label>
        <input
          id="conv-value"
          v-model="value"
          type="text"
          inputmode="decimal"
          autocomplete="off"
          class="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-2xl font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-900"
          :aria-invalid="value.trim() !== '' && !parsed"
        >
        <label
          for="conv-from"
          class="sr-only"
        >De</label>
        <select
          id="conv-from"
          v-model="from"
          :class="selectClass"
        >
          <template
            v-for="g in groups"
            :key="g.label"
          >
            <optgroup
              v-if="g.label"
              :label="g.label"
            >
              <option
                v-for="o in g.options"
                :key="o.value"
                :value="o.value"
              >
                {{ o.label }}
              </option>
            </optgroup>
            <template v-else>
              <option
                v-for="o in g.options"
                :key="o.value"
                :value="o.value"
              >
                {{ o.label }}
              </option>
            </template>
          </template>
        </select>
      </div>

      <div class="flex justify-center sm:pb-1.5">
        <button
          type="button"
          class="rounded-full border border-slate-300 p-2.5 text-slate-600 hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
          aria-label="Invertir"
          @click="swap"
        >
          <AppIcon
            name="swap"
            class="sm:rotate-90"
          />
        </button>
      </div>

      <!-- Destino -->
      <div class="min-w-0 space-y-2">
        <span class="block text-sm font-medium text-slate-600 dark:text-slate-400">Resultado</span>
        <output
          for="conv-value conv-from conv-to"
          class="block min-h-[3.25rem] w-full min-w-0 rounded-lg bg-brand-50 px-3 py-2.5 text-2xl font-semibold break-all text-brand-900 tabular-nums dark:bg-brand-900/30 dark:text-brand-100"
          :class="props.placeholder && 'text-base font-normal opacity-70'"
          aria-live="polite"
        >{{ resultText }}</output>
        <label
          for="conv-to"
          class="sr-only"
        >A</label>
        <select
          id="conv-to"
          v-model="to"
          :class="selectClass"
        >
          <template
            v-for="g in groups"
            :key="g.label"
          >
            <optgroup
              v-if="g.label"
              :label="g.label"
            >
              <option
                v-for="o in g.options"
                :key="o.value"
                :value="o.value"
              >
                {{ o.label }}
              </option>
            </optgroup>
            <template v-else>
              <option
                v-for="o in g.options"
                :key="o.value"
                :value="o.value"
              >
                {{ o.label }}
              </option>
            </template>
          </template>
        </select>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:border-brand-500 disabled:opacity-40 dark:border-slate-700"
        :disabled="!result"
        @click="copy(resultText, 'Resultado copiado')"
      >
        <AppIcon
          name="copy"
          :size="16"
        /> Copiar
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:border-brand-500 disabled:opacity-40 dark:border-slate-700"
        :disabled="!result"
        @click="shareResult"
      >
        <AppIcon
          name="share"
          :size="16"
        /> Compartir
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm"
        :class="isFavorite ? 'border-amber-400 text-amber-600 dark:text-amber-400' : 'border-slate-200 hover:border-brand-500 dark:border-slate-700'"
        :aria-pressed="isFavorite"
        @click="toggle(props.favorite)"
      >
        <AppIcon
          name="star"
          :size="16"
          :filled="isFavorite"
        /> {{ isFavorite ? 'En favoritos' : 'Favorito' }}
      </button>
    </div>
  </section>
</template>
