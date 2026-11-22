<script setup lang="ts">
import { parseNumber } from '@convertia/core'

const { data, status, isOffline, load } = useRates()

const ORDER = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'tarjeta', 'cripto', 'mayorista']
const LABELS: Record<string, string> = { bolsa: 'MEP (bolsa)', contadoconliqui: 'Contado con liqui (CCL)' }

const dolares = computed(() => {
  const d = data.value?.ar?.dolares ?? {}
  return ORDER.filter(k => d[k]).map(k => ({ casa: k, ...d[k]!, nombre: LABELS[k] ?? d[k]!.nombre }))
})

// --- Conversor: comprar dólares usa el precio de VENTA; venderlos, el de COMPRA. ---
const casa = ref('blue')
const direction = ref<'ars-usd' | 'usd-ars'>('usd-ars')
const amount = ref('100')

const selected = computed(() => dolares.value.find(d => d.casa === casa.value) ?? dolares.value[0])
const conversion = computed(() => {
  const n = parseNumber(amount.value)
  const d = selected.value
  if (!n || !d) return undefined
  const value = Number(n.toString())
  if (direction.value === 'usd-ars') {
    const price = d.compra ?? d.venta
    return price ? { text: formatPesos(value * price), note: `Si vendés: ${formatPesos(price)} por dólar (precio de compra)` } : undefined
  }
  const price = d.venta ?? d.compra
  return price ? { text: `US$ ${(value / price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, note: `Si comprás: ${formatPesos(price)} por dólar (precio de venta)` } : undefined
})

const gap = computed(() => {
  const oficial = data.value?.ar?.dolares?.oficial?.venta
  const blue = data.value?.ar?.dolares?.blue?.venta
  return oficial && blue ? (blue / oficial - 1) * 100 : undefined
})

const time = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const when = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : time.format(d)
}
</script>

<template>
  <ToolPage
    path="/dolar"
    seo-title="Dólar hoy: blue, oficial, MEP y CCL"
  >
    <p
      v-if="isOffline"
      class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
    >
      <AppIcon
        name="wifi-off"
        :size="14"
      /> Sin conexión: mostrando la última cotización guardada
    </p>

    <section
      v-if="dolares.length"
      class="grid grid-cols-2 gap-2 sm:grid-cols-3"
    >
      <button
        v-for="d in dolares"
        :key="d.casa"
        type="button"
        class="rounded-xl border p-3 text-left"
        :class="d.casa === casa ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-200 hover:border-brand-500 dark:border-slate-800'"
        :aria-pressed="d.casa === casa"
        @click="casa = d.casa"
      >
        <span class="block text-sm font-medium text-slate-600 dark:text-slate-400">{{ d.nombre }}</span>
        <span class="mt-1 block text-xl font-semibold tabular-nums">{{ d.venta != null ? formatPesos(d.venta) : '—' }}</span>
        <span
          v-if="d.compra != null"
          class="block text-xs text-slate-500 tabular-nums"
        >Compra {{ formatPesos(d.compra) }}</span>
        <span class="block text-xs text-slate-400">{{ when(d.actualizado) }}</span>
      </button>
    </section>
    <p
      v-else-if="status === 'error'"
      class="text-slate-600"
    >
      No se pudieron cargar las cotizaciones. <button
        type="button"
        class="underline"
        @click="load(true)"
      >
        Reintentar
      </button>
    </p>
    <p
      v-else
      class="text-slate-500"
    >
      Cargando cotizaciones…
    </p>

    <p
      v-if="gap !== undefined"
      class="text-sm text-slate-600 dark:text-slate-400"
    >
      Brecha blue/oficial: <strong>{{ formatPct(gap, 1) }}</strong>
    </p>

    <section
      v-if="selected"
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60"
    >
      <h2 class="text-lg font-semibold">
        Convertir con el dólar {{ selected.nombre.toLowerCase() }}
      </h2>
      <div
        class="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700"
        role="radiogroup"
        aria-label="Dirección"
      >
        <button
          type="button"
          role="radio"
          :aria-checked="direction === 'usd-ars'"
          class="rounded-md px-3 py-1.5 text-sm font-medium"
          :class="direction === 'usd-ars' ? 'bg-brand-700 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="direction = 'usd-ars'"
        >
          Dólares → pesos
        </button>
        <button
          type="button"
          role="radio"
          :aria-checked="direction === 'ars-usd'"
          class="rounded-md px-3 py-1.5 text-sm font-medium"
          :class="direction === 'ars-usd' ? 'bg-brand-700 text-white' : 'text-slate-600 dark:text-slate-300'"
          @click="direction = 'ars-usd'"
        >
          Pesos → dólares
        </button>
      </div>
      <NumberField
        v-model="amount"
        :label="direction === 'usd-ars' ? 'Dólares' : 'Pesos'"
        :prefix="direction === 'usd-ars' ? 'US$' : '$'"
        large
      />
      <div v-if="conversion">
        <CopyField
          :label="direction === 'usd-ars' ? 'Recibís (pesos)' : 'Te alcanza para'"
          :value="conversion.text"
          large
        />
        <p class="mt-1 text-xs text-slate-500">
          {{ conversion.note }}
        </p>
      </div>
    </section>

    <p class="text-sm text-slate-500">
      Fuente: <a
        href="https://dolarapi.com"
        rel="noopener"
        class="underline"
      >DolarApi</a>. El «tarjeta» incluye las percepciones vigentes sobre el oficial. Valores de referencia: cada banco o casa de cambio tiene su precio.
      Para otras monedas, usá el <NuxtLink
        to="/monedas"
        class="underline"
      >conversor de monedas</NuxtLink>.
    </p>
  </ToolPage>
</template>
