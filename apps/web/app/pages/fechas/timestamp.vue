<script setup lang="ts">
import { fromUnix } from '@convertia/core'

const stamp = ref('')
const local = ref('')
const now = ref<number>()
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = Date.now()
  stamp.value = String(Math.floor(now.value / 1000))
  timer = setInterval(() => (now.value = Date.now()), 1000)
  const d = new Date()
  d.setSeconds(0, 0)
  local.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
})
onUnmounted(() => clearInterval(timer))

const fromStamp = computed(() => {
  const text = stamp.value.trim()
  if (!/^-?\d+$/.test(text)) return undefined
  try {
    const { ms, unit } = fromUnix(Number(text))
    const date = new Date(ms)
    if (Number.isNaN(date.getTime())) return undefined
    return {
      unit,
      local: date.toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'medium' }),
      utc: date.toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'UTC' }),
      iso: date.toISOString(),
    }
  }
  catch {
    return undefined
  }
})

const fromLocal = computed(() => {
  if (!local.value) return undefined
  const ms = new Date(local.value).getTime() // datetime-local se interpreta en el huso del dispositivo
  return Number.isNaN(ms) ? undefined : { s: String(Math.floor(ms / 1000)), ms: String(ms) }
})

const tz = ref('')
onMounted(() => (tz.value = Intl.DateTimeFormat().resolvedOptions().timeZone))
</script>

<template>
  <ToolPage
    path="/fechas/timestamp"
    seo-title="Convertir timestamp Unix a fecha"
  >
    <p
      v-if="now"
      class="text-slate-600 dark:text-slate-400"
    >
      Ahora: <strong class="font-mono text-slate-900 tabular-nums dark:text-slate-100">{{ Math.floor(now / 1000) }}</strong>
    </p>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <h2 class="font-semibold">
        Timestamp → fecha
      </h2>
      <label class="block">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Timestamp (segundos o milisegundos)</span>
        <input
          v-model="stamp"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-mono text-xl dark:border-slate-700 dark:bg-slate-900"
        >
      </label>
      <div
        v-if="fromStamp"
        class="grid gap-3"
      >
        <p class="text-xs text-slate-500">
          Interpretado en {{ fromStamp.unit === 's' ? 'segundos' : 'milisegundos' }}.
        </p>
        <CopyField
          :label="`Hora local${tz ? ` (${tz})` : ''}`"
          :value="fromStamp.local"
        />
        <CopyField
          label="UTC"
          :value="fromStamp.utc"
        />
        <CopyField
          label="ISO 8601"
          :value="fromStamp.iso"
          mono
        />
      </div>
    </section>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <h2 class="font-semibold">
        Fecha → timestamp
      </h2>
      <label class="block">
        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Fecha y hora local</span>
        <input
          v-model="local"
          type="datetime-local"
          class="mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-lg dark:border-slate-700 dark:bg-slate-900 dark:scheme-dark"
        >
      </label>
      <div
        v-if="fromLocal"
        class="grid gap-3 sm:grid-cols-2"
      >
        <CopyField
          label="Segundos"
          :value="fromLocal.s"
          mono
        />
        <CopyField
          label="Milisegundos"
          :value="fromLocal.ms"
          mono
        />
      </div>
    </section>
  </ToolPage>
</template>
