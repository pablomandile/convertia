<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const notFound = computed(() => props.error.statusCode === 404)

useSeoMeta({ title: notFound.value ? 'No encontrado' : 'Error' })
</script>

<template>
  <NuxtLayout>
    <div class="py-16 text-center">
      <p class="text-5xl">
        {{ notFound ? '🔎' : '⚠️' }}
      </p>
      <h1 class="mt-4 text-2xl font-bold">
        {{ notFound ? 'No encontramos esa conversión' : 'Algo salió mal' }}
      </h1>
      <p class="mt-2 text-slate-600 dark:text-slate-400">
        Probá escribiéndola en la barra de arriba, o volvé al inicio.
      </p>
      <button
        type="button"
        class="mt-6 rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-600"
        @click="clearError({ redirect: '/' })"
      >
        Ir al inicio
      </button>
    </div>
  </NuxtLayout>
</template>
