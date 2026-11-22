<script setup lang="ts">
import { categories } from '@convertia/core'

const route = useRoute()
const { isDark, toggle } = useTheme()
const isHome = computed(() => route.path === '/')
const { enabled: accountsEnabled, user } = useAuth()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur dark:border-slate-800/80 dark:bg-slate-950/85">
      <div class="mx-auto flex h-14 max-w-3xl items-center gap-3 px-4">
        <NuxtLink
          to="/"
          class="shrink-0 text-lg font-bold tracking-tight text-brand-700 dark:text-brand-500"
        >
          Convertia
        </NuxtLink>
        <SmartBar
          v-if="!isHome"
          compact
          class="min-w-0 flex-1"
        />
        <div
          v-else
          class="flex-1"
        />
        <InstallButton />
        <NuxtLink
          v-if="accountsEnabled"
          to="/cuenta"
          class="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          :aria-label="user ? 'Mi cuenta (sesión iniciada)' : 'Mi cuenta'"
        >
          <AppIcon name="user" />
          <span
            v-if="user"
            class="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-slate-950"
            aria-hidden="true"
          />
        </NuxtLink>
        <button
          type="button"
          class="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          :aria-label="isDark ? 'Usar tema claro' : 'Usar tema oscuro'"
          @click="toggle"
        >
          <AppIcon :name="isDark ? 'sun' : 'moon'" />
        </button>
      </div>
    </header>

    <main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <slot />
    </main>

    <footer class="border-t border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <div class="mx-auto max-w-3xl px-4 py-8">
        <nav
          aria-label="Categorías"
          class="flex flex-wrap gap-x-4 gap-y-2"
        >
          <NuxtLink
            to="/monedas"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >Monedas</NuxtLink>
          <NuxtLink
            v-for="c in categories"
            :key="c.id"
            :to="`/${c.slug}`"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >
            {{ c.name.es }}
          </NuxtLink>
        </nav>
        <nav
          aria-label="Herramientas"
          class="mt-4 flex flex-wrap gap-x-4 gap-y-2"
        >
          <NuxtLink
            v-for="t in tools"
            :key="t.path"
            :to="t.path"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >
            {{ t.name }}
          </NuxtLink>
        </nav>
        <p class="mt-6">
          Cotizaciones:
          <a
            href="https://www.exchangerate-api.com"
            rel="noopener"
            class="underline"
          >Rates By Exchange Rate API</a>,
          <a
            href="https://www.coingecko.com"
            rel="noopener"
            class="underline"
          >CoinGecko</a>,
          <a
            href="https://dolarapi.com"
            rel="noopener"
            class="underline"
          >DolarApi</a>,
          <a
            href="https://argentinadatos.com"
            rel="noopener"
            class="underline"
          >ArgentinaDatos</a> y
          <a
            href="https://frankfurter.dev"
            rel="noopener"
            class="underline"
          >Frankfurter</a> (BCE).
          Valores de referencia, sin garantía.
        </p>
        <nav
          aria-label="Legales"
          class="mt-4 flex flex-wrap gap-x-4 gap-y-2"
        >
          <NuxtLink
            to="/terminos"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >Términos</NuxtLink>
          <NuxtLink
            to="/privacidad"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >Privacidad</NuxtLink>
          <NuxtLink
            to="/cookies"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >Datos en tu navegador</NuxtLink>
          <NuxtLink
            v-if="accountsEnabled"
            to="/cuenta"
            class="hover:text-brand-700 dark:hover:text-brand-500"
          >Mi cuenta</NuxtLink>
        </nav>
      </div>
    </footer>
  </div>
</template>
