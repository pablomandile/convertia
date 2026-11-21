<script setup lang="ts">
const { canInstall, isIos, install } = usePwaInstall()
const showHelp = ref(false)
const busy = ref(false)

async function onClick() {
  if (busy.value) return
  busy.value = true
  try {
    // 'manual' = iOS, o el prompt ya se usó: explicamos los pasos a mano.
    if ((await install()) === 'manual') showHelp.value = true
  }
  finally {
    busy.value = false
  }
}

// Que el instructivo no sobreviva a una navegación (skill overlays-al-navegar).
const route = useRoute()
watch(() => route.fullPath, () => (showHelp.value = false))

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') showHelp.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <button
    v-if="canInstall"
    type="button"
    class="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 dark:text-brand-500 dark:hover:bg-slate-800"
    :disabled="busy"
    @click="onClick"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    ><path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /></svg>
    <span class="hidden sm:inline">Instalar app</span>
    <span class="sr-only sm:hidden">Instalar app</span>
  </button>

  <Teleport to="body">
    <div
      v-if="showHelp"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      @click.self="showHelp = false"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-help-title"
        class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"
      >
        <h2
          id="install-help-title"
          class="text-lg font-semibold"
        >
          Instalar Convertia
        </h2>
        <ol
          v-if="isIos"
          class="mt-3 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300"
        >
          <li>Tocá <strong>Compartir</strong> en la barra de Safari.</li>
          <li>Elegí <strong>Agregar a inicio</strong>.</li>
        </ol>
        <ol
          v-else
          class="mt-3 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300"
        >
          <li>Abrí el menú del navegador (⋮).</li>
          <li>Elegí <strong>Instalar aplicación</strong> o <strong>Agregar a la pantalla principal</strong>.</li>
        </ol>
        <button
          type="button"
          class="mt-5 w-full rounded-lg bg-brand-700 px-4 py-2 font-medium text-white hover:bg-brand-600"
          @click="showHelp = false"
        >
          Entendido
        </button>
      </div>
    </div>
  </Teleport>
</template>
