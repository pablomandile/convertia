<script setup lang="ts">
import { convert, convertCurrency, fromRoman, parseQuery } from '@convertia/core'

const props = defineProps<{ compact?: boolean }>()

const query = ref('')
const input = ref<HTMLInputElement>()
const { rates, status } = useRates()

interface Outcome { text: string, href: string, pending?: boolean }

const outcome = computed<Outcome | null>(() => {
  const parsed = parseQuery(query.value, { rates: rates.value })
  if (!parsed) {
    // ¿Un número romano? (al menos 2 letras, para no confundir "m" o "l" sueltas).
    const text = query.value.trim()
    if (/^[MDCLXVI]{2,}$/i.test(text)) {
      try {
        // Sin separador de miles: los romanos llegan a 3999 y suelen ser años ("2026", no "2.026").
        return { text: `${text.toUpperCase()} = ${fromRoman(text)}`, href: '/numeros/romanos' }
      }
      catch { /* no es un romano válido */ }
    }
    return null
  }
  // "5 ft 10 in" da 5,8333…: para la URL alcanza con 10 cifras significativas.
  const value = parsed.value.toSignificantDigits(10).toString()

  if (parsed.kind === 'unit') {
    const to = parsed.to ?? defaultTarget(parsed.category, parsed.from)
    try {
      const result = convert(parsed.value, parsed.category.id, parsed.from.id, to.id)
      return {
        text: `${formatNumber(parsed.value)} ${parsed.from.symbol} = ${formatNumber(result)} ${to.symbol}`,
        href: unitPairPath(parsed.category, parsed.from, to, value),
      }
    }
    catch {
      return null
    }
  }

  const to = parsed.to ?? (parsed.from === 'ARS' ? 'USD' : 'ARS')
  const href = currencyPairHref(parsed.from, to, value)
  if (!rates.value) {
    return { text: status.value === 'error' ? 'Sin cotizaciones por ahora' : 'Cargando cotizaciones…', href, pending: true }
  }
  try {
    const result = convertCurrency(parsed.value, parsed.from, to, rates.value)
    return { text: `${formatMoney(parsed.value)} ${parsed.from} = ${formatMoney(result)} ${to}`, href }
  }
  catch {
    return null
  }
})

// Si no es una conversión, ¿es el nombre de una herramienta? ("iva", "dólar blue", "cheque")
const suggestions = computed(() => outcome.value ? [] : searchTools(query.value))

async function submit() {
  const href = outcome.value?.href ?? suggestions.value[0]?.path
  if (!href) return
  await navigateTo(href)
  if (props.compact) {
    query.value = ''
    input.value?.blur()
  }
}

const examples = ['100 usd a ars', '5 ft 10 in en cm', '72 f a c', '3000 frigorías a btu/h', '8 l/100km a mpg', '2 tazas a ml']

function pickExample(example: string) {
  query.value = example
  input.value?.focus()
}
</script>

<template>
  <div class="relative">
    <form
      role="search"
      @submit.prevent="submit"
    >
      <label
        for="smartbar"
        class="sr-only"
      >Escribí qué querés convertir</label>
      <div
        class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900"
        :class="props.compact ? 'px-2.5 py-1.5' : 'px-4 py-3'"
      >
        <AppIcon
          name="search"
          :size="props.compact ? 16 : 20"
          class="text-slate-400"
        />
        <input
          id="smartbar"
          ref="input"
          v-model="query"
          type="text"
          inputmode="text"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="go"
          :placeholder="props.compact ? 'Convertir…' : 'Ej: 100 usd a ars · 5 ft 10 in en cm'"
          class="w-full min-w-0 bg-transparent outline-none placeholder:text-slate-400"
          :class="props.compact ? 'text-sm' : 'text-lg'"
        >
        <button
          v-if="query"
          type="button"
          class="rounded p-0.5 text-slate-400 hover:text-slate-600"
          aria-label="Borrar"
          @click="query = ''"
        >
          <AppIcon
            name="x"
            :size="16"
          />
        </button>
      </div>
    </form>

    <!-- Resultado en vivo -->
    <div
      v-if="query.trim()"
      :class="props.compact ? 'absolute inset-x-0 top-full z-30 mt-1' : 'mt-3'"
    >
      <NuxtLink
        v-if="outcome"
        :to="outcome.href"
        class="flex items-center justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-brand-900 shadow-sm hover:border-brand-500 dark:border-brand-900 dark:bg-slate-900 dark:text-brand-100"
        @click="props.compact && (query = '')"
      >
        <span
          id="smartbar-result"
          class="min-w-0 font-semibold wrap-break-word"
          :class="[props.compact ? 'text-sm' : 'text-lg', outcome.pending && 'font-normal opacity-70']"
          aria-live="polite"
        >{{ outcome.text }}</span>
        <AppIcon
          name="arrow-right"
          :size="18"
          class="text-brand-600"
        />
      </NuxtLink>
      <ul
        v-else-if="suggestions.length"
        class="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
        aria-label="Herramientas sugeridas"
      >
        <li
          v-for="t in suggestions"
          :key="t.path"
        >
          <NuxtLink
            :to="t.path"
            class="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800"
            @click="props.compact && (query = '')"
          >
            <span aria-hidden="true">{{ t.emoji }}</span>
            <span class="min-w-0">
              <span class="block font-medium">{{ t.name }}</span>
              <span
                v-if="!props.compact"
                class="block truncate text-sm text-slate-500"
              >{{ t.description }}</span>
            </span>
          </NuxtLink>
        </li>
      </ul>
      <p
        v-else
        class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        Probá con un número y una unidad: «10 km a millas», «50 euros en pesos».
      </p>
    </div>

    <div
      v-if="!props.compact && !query"
      class="mt-3 flex flex-wrap gap-2"
    >
      <button
        v-for="example in examples"
        :key="example"
        type="button"
        class="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-brand-500 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300"
        @click="pickExample(example)"
      >
        {{ example }}
      </button>
    </div>
  </div>
</template>
