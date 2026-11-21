<script setup lang="ts">
import { categories, convert, getCategory, parseNumber, parsePairSlug, unitPlural, type Decimal } from '@convertia/core'

// Mismo componente para /longitud y /longitud/pies-a-metros: cambiar de par no lo vuelve a montar.
definePageMeta({ key: route => `cat:${route.params.categoria}` })

const route = useRoute()
const router = useRouter()

const category = getCategory(String(route.params.categoria))
if (!category || category.slug !== route.params.categoria) {
  throw createError({ statusCode: 404, statusMessage: 'No encontramos esa conversión', fatal: true })
}

const unitById = (id: string) => category.units.find(u => u.id === id)!

function pairFromRoute() {
  const par = route.params.par ? String(route.params.par) : ''
  if (!par) {
    const [f, t] = category!.popular?.[0] ?? [category!.units[0]!.id, category!.units[1]!.id]
    return { from: unitById(f), to: unitById(t), explicit: false }
  }
  const pair = parsePairSlug(category!, par)
  if (!pair) throw createError({ statusCode: 404, statusMessage: 'No encontramos esa conversión', fatal: true })
  return { ...pair, explicit: true }
}

const initial = pairFromRoute()
const from = ref(initial.from.id)
const to = ref(initial.to.id)
const value = ref(typeof route.query.v === 'string' && route.query.v ? route.query.v : '1')
const explicit = ref(initial.explicit)

const fromUnit = computed(() => unitById(from.value))
const toUnit = computed(() => unitById(to.value))

// --- URL ↔ estado ---------------------------------------------------------
const queryValue = computed(() => {
  const n = parseNumber(value.value)
  return n && value.value !== '1' ? n.toString() : undefined
})

watch([from, to], () => {
  explicit.value = true
  router.replace(unitPairPath(category, fromUnit.value, toUnit.value, queryValue.value))
})

let valueTimer: ReturnType<typeof setTimeout> | undefined
watch(value, () => {
  clearTimeout(valueTimer)
  valueTimer = setTimeout(() => {
    router.replace({ query: queryValue.value ? { v: queryValue.value } : {} })
  }, 600)
})

// Atrás / adelante del navegador, o la barra inteligente llevando a otro par de esta categoría
watch(() => route.params.par, () => {
  const pair = pairFromRoute()
  if (pair.from.id !== from.value) from.value = pair.from.id
  if (pair.to.id !== to.value) to.value = pair.to.id
})
watch(() => route.query.v, (v) => {
  const incoming = parseNumber(typeof v === 'string' && v ? v : '1')
  const current = parseNumber(value.value)
  // Solo si cambió el número: no pisar lo que el usuario está escribiendo ("1,5" vs "1.5").
  if (incoming && (!current || !incoming.eq(current))) value.value = typeof v === 'string' && v ? v : '1'
})

// --- Recientes -------------------------------------------------------------
const { push } = useRecent()
const favorite = computed(() => ({
  key: `unit:${category.id}:${from.value}:${to.value}`,
  label: `${unitPlural(fromUnit.value)} → ${unitPlural(toUnit.value)}`,
  href: unitPairPath(category, fromUnit.value, toUnit.value),
}))
onMounted(() => {
  watch(favorite, (item) => {
    if (explicit.value) push(item)
  }, { immediate: true })
})

// --- Contenido -------------------------------------------------------------
const options = category.units.map(u => ({ value: u.id, label: `${u.name.es} (${u.symbol})` }))
const doConvert = (v: Decimal, f: string, t: string) => convert(v, category.id, f, t)
const symbol = (id: string) => unitById(id).symbol

const oneUnit = computed(() => formatNumber(convert(1, category.id, from.value, to.value)))
const table = computed(() => [1, 2, 3, 5, 10, 20, 50, 100, 1000].map(n => ({
  n: n.toLocaleString('es-AR'),
  result: formatNumber(convert(n, category.id, from.value, to.value)),
})))
const all = computed(() => {
  const v = parseNumber(value.value)
  if (!v) return []
  return category.units.filter(u => u.id !== from.value).map((u) => {
    let text = '—'
    try {
      text = formatNumber(convert(v, category.id, from.value, u.id))
    }
    catch { /* división por cero */ }
    return { unit: u, text }
  })
})
const popular = (category.popular ?? []).map(([f, t]) => ({
  href: unitPairPath(category, unitById(f), unitById(t)),
  label: `${unitPlural(unitById(f))} a ${unitPlural(unitById(t)).toLowerCase()}`,
}))
const others = categories.filter(c => c.id !== category.id)

// --- SEO -------------------------------------------------------------------
const title = computed(() => explicit.value
  ? `${unitPlural(fromUnit.value)} a ${unitPlural(toUnit.value).toLowerCase()} (${fromUnit.value.symbol} → ${toUnit.value.symbol})`
  : `Conversor de ${category.name.es.toLowerCase()}`)
const description = computed(() => explicit.value
  ? `Convertí ${unitPlural(fromUnit.value).toLowerCase()} a ${unitPlural(toUnit.value).toLowerCase()}: 1 ${fromUnit.value.symbol} = ${oneUnit.value} ${toUnit.value.symbol}. Gratis, al instante y sin conexión.`
  : `Convertí entre ${category.units.length} unidades de ${category.name.es.toLowerCase()}: ${category.units.slice(0, 5).map(u => u.name.es.toLowerCase()).join(', ')} y más.`)

useSeoMeta({ title, description, ogTitle: title, ogDescription: description })
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-sm font-medium text-brand-700 dark:text-brand-500">
        <NuxtLink :to="`/${category.slug}`">
          {{ category.name.es }}
        </NuxtLink>
      </p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {{ title }}
      </h1>
      <p class="mt-2 text-slate-600 dark:text-slate-400">
        1 {{ fromUnit.name.es.toLowerCase() }} = <strong class="tabular-nums">{{ oneUnit }}</strong> {{ unitPlural(toUnit).toLowerCase() }}
      </p>
    </div>

    <ConverterCard
      v-model:from="from"
      v-model:to="to"
      v-model:value="value"
      :options="options"
      :convert="doConvert"
      :format="formatNumber"
      :symbol="symbol"
      :favorite="favorite"
      :share-title="title"
    />

    <section v-if="all.length">
      <h2 class="text-lg font-semibold">
        {{ value }} {{ fromUnit.symbol }} en todas las unidades
      </h2>
      <ul class="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        <li
          v-for="row in all"
          :key="row.unit.id"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-900"
            :class="row.unit.id === to && 'bg-brand-50/60 dark:bg-brand-900/20'"
            @click="to = row.unit.id"
          >
            <span class="min-w-0 truncate text-slate-600 dark:text-slate-400">{{ row.unit.name.es }}</span>
            <span class="shrink-0 font-medium tabular-nums">{{ row.text }} <span class="text-slate-500">{{ row.unit.symbol }}</span></span>
          </button>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Tabla de {{ unitPlural(fromUnit).toLowerCase() }} a {{ unitPlural(toUnit).toLowerCase() }}
      </h2>
      <table class="mt-3 w-full overflow-hidden rounded-xl border border-slate-200 text-left dark:border-slate-800">
        <thead class="bg-slate-50 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th class="px-4 py-2 font-medium">
              {{ fromUnit.name.es }} ({{ fromUnit.symbol }})
            </th>
            <th class="px-4 py-2 font-medium">
              {{ toUnit.name.es }} ({{ toUnit.symbol }})
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

    <section v-if="popular.length">
      <h2 class="text-lg font-semibold">
        Conversiones populares
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="p in popular"
          :key="p.href"
          :to="p.href"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-brand-500 hover:text-brand-700 dark:border-slate-700"
        >
          {{ p.label }}
        </NuxtLink>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Otras conversiones
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          to="/monedas"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-brand-500 dark:border-slate-700"
        >
          Monedas
        </NuxtLink>
        <NuxtLink
          v-for="c in others"
          :key="c.id"
          :to="`/${c.slug}`"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-brand-500 dark:border-slate-700"
        >
          {{ c.name.es }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
