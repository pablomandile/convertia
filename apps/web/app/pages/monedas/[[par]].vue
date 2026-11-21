<script setup lang="ts">
import { convertCurrency, currencyName, parseNumber, type Decimal } from '@convertia/core'

definePageMeta({ key: 'monedas' })

const route = useRoute()
const router = useRouter()
const { data, rates, status, isOffline, updatedAt, load } = useRates()

const CRYPTO = new Set(['BTC', 'ETH', 'USDT', 'USDC', 'SOL'])

function pairFromRoute() {
  const par = route.params.par ? String(route.params.par) : ''
  if (!par) return { from: 'USD', to: 'ARS', explicit: false }
  const m = par.match(/^([a-z]{3,5})-a-([a-z]{3,5})$/)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'No encontramos esa conversión', fatal: true })
  return { from: m[1]!.toUpperCase(), to: m[2]!.toUpperCase(), explicit: true }
}

const initial = pairFromRoute()
const from = ref(initial.from)
const to = ref(initial.to)
const value = ref(typeof route.query.v === 'string' && route.query.v ? route.query.v : '1')
const explicit = ref(initial.explicit)

const queryValue = computed(() => {
  const n = parseNumber(value.value)
  return n && value.value !== '1' ? n.toString() : undefined
})

watch([from, to], () => {
  explicit.value = true
  router.replace(currencyPairHref(from.value, to.value, queryValue.value))
})

let valueTimer: ReturnType<typeof setTimeout> | undefined
watch(value, () => {
  clearTimeout(valueTimer)
  valueTimer = setTimeout(() => {
    router.replace({ query: queryValue.value ? { v: queryValue.value } : {} })
  }, 600)
})

watch(() => route.params.par, () => {
  const pair = pairFromRoute()
  if (pair.from !== from.value) from.value = pair.from
  if (pair.to !== to.value) to.value = pair.to
})
watch(() => route.query.v, (v) => {
  const incoming = parseNumber(typeof v === 'string' && v ? v : '1')
  const current = parseNumber(value.value)
  if (incoming && (!current || !incoming.eq(current))) value.value = typeof v === 'string' && v ? v : '1'
})

// --- Opciones de los selectores -------------------------------------------
const label = (code: string) => `${code} · ${currencyName(code)}`
const options = computed(() => {
  const codes = Object.keys(rates.value ?? {})
  const available = codes.length ? codes : featuredCurrencies
  // Siempre incluir lo elegido, aunque todavía no haya cotizaciones cargadas.
  const set = new Set([...available, from.value, to.value])
  const featured = featuredCurrencies.filter(c => set.has(c))
  const rest = [...set].filter(c => !featuredCurrencies.includes(c))
  return [
    ...featured.map(c => ({ value: c, label: label(c), group: 'Más usadas' })),
    ...rest.filter(c => !CRYPTO.has(c)).sort((a, b) => currencyName(a).localeCompare(currencyName(b), 'es')).map(c => ({ value: c, label: label(c), group: 'Todas las monedas' })),
    ...rest.filter(c => CRYPTO.has(c)).map(c => ({ value: c, label: label(c), group: 'Cripto' })),
  ]
})

const missing = computed(() => rates.value ? [from.value, to.value].filter(c => !(c in rates.value!)) : [])
const placeholder = computed(() => {
  if (!rates.value) return status.value === 'error' ? 'No se pudieron cargar las cotizaciones' : 'Cargando cotizaciones…'
  if (missing.value.length) return `No tenemos cotización para ${missing.value.join(' y ')}`
  return undefined
})

const doConvert = (v: Decimal, f: string, t: string) => rates.value ? convertCurrency(v, f, t, rates.value) : undefined
const format = (v: Decimal) => formatMoney(v)
const symbol = (code: string) => code

const oneUnit = computed(() => {
  if (placeholder.value) return undefined
  return formatMoney(convertCurrency(1, from.value, to.value, rates.value!))
})
const table = computed(() => {
  if (placeholder.value) return []
  return [1, 5, 10, 20, 50, 100, 500, 1000, 10000].map(n => ({
    n: n.toLocaleString('es-AR'),
    result: formatMoney(convertCurrency(n, from.value, to.value, rates.value!)),
  }))
})

const dateFormat = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' })
const updatedText = computed(() => updatedAt.value ? dateFormat.format(updatedAt.value) : undefined)

// Dólares de Argentina, cuando el par incluye pesos y dólares.
const showAr = computed(() => [from.value, to.value].includes('ARS') && [from.value, to.value].includes('USD'))
const AR_ORDER = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'tarjeta', 'cripto', 'mayorista']
const dolares = computed(() => {
  const d = data.value?.ar?.dolares ?? {}
  return AR_ORDER.filter(k => d[k]).map(k => ({ casa: k, ...d[k]! }))
})
const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 })

// --- Recientes y favoritos -------------------------------------------------
const { push } = useRecent()
const favorite = computed(() => ({
  key: `currency:${from.value}:${to.value}`,
  label: `${from.value} → ${to.value}`,
  href: currencyPairPath(from.value, to.value),
}))
onMounted(() => {
  watch(favorite, (item) => {
    if (explicit.value) push(item)
  }, { immediate: true })
})

// --- SEO -------------------------------------------------------------------
const title = computed(() => explicit.value
  ? `${currencyName(from.value)} a ${currencyName(to.value).toLowerCase()} (${from.value} → ${to.value}) hoy`
  : 'Conversor de monedas')
const description = computed(() => explicit.value
  ? `Convertí ${from.value} a ${to.value} con la cotización del día. Más de 160 monedas y cripto, gratis y sin conexión.`
  : 'Convertí entre más de 160 monedas del mundo y cripto, con cotizaciones actualizadas. Incluye los dólares de Argentina.')
useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-sm font-medium text-brand-700 dark:text-brand-500">
        <NuxtLink to="/monedas">
          Monedas
        </NuxtLink>
      </p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {{ title }}
      </h1>
      <p
        v-if="oneUnit"
        class="mt-2 text-slate-600 dark:text-slate-400"
      >
        1 {{ from }} = <strong class="tabular-nums">{{ oneUnit }}</strong> {{ to }}
      </p>
      <p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span
          v-if="isOffline"
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        >
          <AppIcon
            name="wifi-off"
            :size="14"
          /> Sin conexión: última cotización guardada
        </span>
        <span v-if="updatedText">Actualizado: {{ updatedText }}</span>
        <button
          v-if="status === 'error'"
          type="button"
          class="underline"
          @click="load(true)"
        >
          Reintentar
        </button>
      </p>
    </div>

    <ConverterCard
      v-model:from="from"
      v-model:to="to"
      v-model:value="value"
      :options="options"
      :convert="doConvert"
      :format="format"
      :symbol="symbol"
      :favorite="favorite"
      :share-title="title"
      :placeholder="placeholder"
    />

    <section v-if="showAr && dolares.length">
      <h2 class="text-lg font-semibold">
        Dólares en Argentina
      </h2>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div
          v-for="d in dolares"
          :key="d.casa"
          class="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
        >
          <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
            {{ d.nombre }}
          </p>
          <p class="mt-1 text-lg font-semibold tabular-nums">
            {{ d.venta != null ? ars.format(d.venta) : '—' }}
          </p>
          <p
            v-if="d.compra != null"
            class="text-xs text-slate-500 tabular-nums"
          >
            Compra {{ ars.format(d.compra) }}
          </p>
        </div>
      </div>
      <p class="mt-2 text-xs text-slate-500">
        Precio de venta. El conversor usa el tipo de cambio de referencia internacional.
      </p>
    </section>

    <section v-if="table.length">
      <h2 class="text-lg font-semibold">
        Tabla de {{ from }} a {{ to }}
      </h2>
      <table class="mt-3 w-full overflow-hidden rounded-xl border border-slate-200 text-left dark:border-slate-800">
        <thead class="bg-slate-50 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th class="px-4 py-2 font-medium">
              {{ from }}
            </th>
            <th class="px-4 py-2 font-medium">
              {{ to }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 tabular-nums dark:divide-slate-800">
          <tr
            v-for="row in table"
            :key="row.n"
          >
            <td class="px-4 py-2">
              {{ row.n }}
            </td>
            <td class="px-4 py-2">
              {{ row.result }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Conversiones populares
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="[f, t] in popularCurrencyPairs"
          :key="`${f}-${t}`"
          :to="currencyPairPath(f, t)"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-brand-500 hover:text-brand-700 dark:border-slate-700"
        >
          {{ f }} a {{ t }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
