<script setup lang="ts">
// Esqueleto común de las herramientas: grupo, título, bajada, contenido y herramientas hermanas.
const props = defineProps<{
  path: string
  /** Título para la pestaña y los buscadores (por defecto, el nombre de la herramienta). */
  seoTitle?: string
}>()

const tool = tools.find(t => t.path === props.path)
if (!tool) throw new Error(`Herramienta no registrada en utils/tools.ts: ${props.path}`)
const siblings = tools.filter(t => t.group === tool.group && t.path !== tool.path)

useSeoMeta({
  title: props.seoTitle ?? tool.name,
  description: tool.description,
  ogTitle: props.seoTitle ?? tool.name,
  ogDescription: tool.description,
})
</script>

<template>
  <div class="space-y-8">
    <div>
      <p class="text-sm font-medium text-brand-700 dark:text-brand-500">
        {{ toolGroups[tool.group] }}
      </p>
      <h1 class="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
        {{ tool.name }}
      </h1>
      <p class="mt-2 text-slate-600 dark:text-slate-400">
        {{ tool.description }}
      </p>
    </div>

    <slot />

    <section v-if="siblings.length">
      <h2 class="text-lg font-semibold">
        Más de {{ toolGroups[tool.group].toLowerCase() }}
      </h2>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="t in siblings"
          :key="t.path"
          :to="t.path"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm hover:border-brand-500 hover:text-brand-700 dark:border-slate-700"
        >
          {{ t.emoji }} {{ t.name }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
