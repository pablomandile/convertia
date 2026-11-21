<script setup lang="ts">
import { categories } from '@convertia/core'

const ICONS: Record<string, string> = {
  length: '📏',
  mass: '⚖️',
  temperature: '🌡️',
  volume: '🧪',
  area: '🗺️',
  speed: '🏎️',
  time: '⏱️',
  data: '💾',
  fuel: '⛽',
  energy: '⚡',
  power: '🔌',
  pressure: '🎈',
  angle: '🧭',
  frequency: '📡',
  density: '🧱',
}

const { favorites } = useFavorites()
const { recent, clear } = useRecent()

useSeoMeta({
  title: 'Convertí unidades y monedas al instante',
  titleTemplate: 'Convertia · %s',
  description: 'Convertí unidades, más de 160 monedas, cripto y los dólares de Argentina. Escribí «100 usd a ars» y listo. Gratis y sin conexión.',
})
</script>

<template>
  <div class="space-y-10">
    <section class="pt-4 sm:pt-10">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        ¿Qué querés convertir?
      </h1>
      <p class="mt-2 text-slate-600 dark:text-slate-400">
        Escribilo como te salga: unidades, monedas, cripto. Funciona sin conexión.
      </p>
      <div class="mt-6">
        <SmartBar />
      </div>
    </section>

    <section v-if="favorites.length">
      <h2 class="text-lg font-semibold">
        Favoritos
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="f in favorites"
          :key="f.key"
          :to="f.href"
          class="inline-flex items-center gap-1.5 rounded-full border border-amber-300 px-3 py-1 text-sm hover:border-amber-500 dark:border-amber-700"
        >
          <AppIcon
            name="star"
            :size="14"
            filled
            class="text-amber-500"
          /> {{ f.label }}
        </NuxtLink>
      </div>
    </section>

    <section v-if="recent.length">
      <div class="flex items-baseline justify-between">
        <h2 class="text-lg font-semibold">
          Recientes
        </h2>
        <button
          type="button"
          class="text-sm text-slate-500 hover:underline"
          @click="clear"
        >
          Borrar
        </button>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="r in recent"
          :key="r.key"
          :to="r.href"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-brand-500 dark:border-slate-700"
        >
          {{ r.label }}
        </NuxtLink>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Categorías
      </h2>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <NuxtLink
          to="/monedas"
          class="col-span-2 flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 hover:border-brand-500 sm:col-span-3 dark:border-brand-900 dark:bg-brand-900/20"
        >
          <span
            class="text-2xl"
            aria-hidden="true"
          >💱</span>
          <span>
            <span class="block font-semibold">Monedas</span>
            <span class="block text-sm text-slate-600 dark:text-slate-400">160+ monedas, cripto y dólares de Argentina</span>
          </span>
        </NuxtLink>
        <NuxtLink
          v-for="c in categories"
          :key="c.id"
          :to="`/${c.slug}`"
          class="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-3 hover:border-brand-500 dark:border-slate-800"
        >
          <span
            class="text-xl"
            aria-hidden="true"
          >{{ ICONS[c.id] ?? '🔁' }}</span>
          <span class="min-w-0 leading-tight font-medium">{{ c.name.es }}</span>
        </NuxtLink>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-semibold">
        Monedas más buscadas
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="[f, t] in popularCurrencyPairs.slice(0, 8)"
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
