<script setup lang="ts">
import { marked } from 'marked'

// Los textos legales viven en content/legal/*.md (se editan como texto, no como plantilla).
// Son contenido propio del repo: se convierten a HTML tal cual.
const props = defineProps<{ source: string, title: string, description: string, versioned?: boolean }>()

const html = marked.parse(props.source, { async: false }) as string
const date = new Date(`${LEGAL_VERSION}T12:00:00Z`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

useSeoMeta({ title: props.title, description: props.description })
</script>

<template>
  <article class="legal mx-auto max-w-2xl">
    <!-- eslint-disable-next-line vue/no-v-html -- Markdown propio del repo (content/legal) -->
    <div v-html="html" />
    <p
      v-if="props.versioned"
      class="mt-8 text-sm text-slate-500"
    >
      Versión del {{ date }}.
    </p>
    <nav class="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <NuxtLink
        to="/terminos"
        class="underline"
      >Términos</NuxtLink>
      <NuxtLink
        to="/privacidad"
        class="underline"
      >Privacidad</NuxtLink>
      <NuxtLink
        to="/cookies"
        class="underline"
      >Datos en tu navegador</NuxtLink>
    </nav>
  </article>
</template>

<style>
@reference "~/assets/css/main.css";

.legal h1 { @apply text-2xl font-bold tracking-tight sm:text-3xl; }
.legal h2 { @apply mt-8 text-lg font-semibold; }
.legal h3 { @apply mt-6 font-semibold; }
.legal p, .legal ul { @apply mt-3 leading-relaxed text-slate-700 dark:text-slate-300; }
.legal ul { @apply list-disc space-y-1.5 pl-5; }
.legal a { @apply text-brand-700 underline wrap-anywhere dark:text-brand-500; }
.legal code { @apply rounded bg-slate-100 px-1 py-0.5 text-sm wrap-anywhere dark:bg-slate-800; }
.legal strong { @apply font-semibold text-slate-900 dark:text-slate-100; }
</style>
