<script setup lang="ts">
// Aviso informativo: todo lo que Convertia guarda es necesario (ver /cookies), así que no hay
// «Rechazar». La marca guarda una VERSIÓN: si algún día entra algo no necesario, se sube y
// el aviso vuelve a aparecer (y entonces tiene que pasar a consentimiento previo).
const KEY = 'convertia:aviso-cookies'
const VERSION = '1'

const visible = ref(false)

onMounted(() => {
  try {
    visible.value = localStorage.getItem(KEY) !== VERSION
  }
  catch {
    visible.value = true
  }
})

function close() {
  visible.value = false
  try {
    localStorage.setItem(KEY, VERSION)
  }
  catch { /* sin almacenamiento: dura lo que dure la pestaña */ }
}
</script>

<template>
  <div
    v-if="visible"
    role="region"
    aria-label="Aviso sobre datos en tu navegador"
    class="fixed inset-x-0 bottom-0 z-40 p-3 sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-sm sm:p-0"
  >
    <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p class="text-sm wrap-anywhere text-slate-700 dark:text-slate-300">
        Convertia no usa cookies ni seguimiento. Guarda en tu navegador solo lo necesario: tus favoritos, tus ajustes y las últimas cotizaciones para usarla sin conexión.
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          class="min-h-11 rounded-lg bg-brand-700 px-4 font-medium text-white hover:bg-brand-600"
          @click="close"
        >
          Entendido
        </button>
        <NuxtLink
          to="/cookies"
          class="inline-flex min-h-11 items-center rounded-lg px-3 text-brand-700 underline dark:text-brand-500"
        >
          Más información
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
