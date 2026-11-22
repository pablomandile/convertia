<script setup lang="ts">
import { CITIES, formatOffset, parseISODate, wallTime, zonedToInstant, zoneOffsetMinutes } from '@convertia/core'

const DEFAULT = ['Buenos Aires', 'Ciudad de México', 'Nueva York', 'Madrid', 'Londres', 'Tokio']

// Estado compartido: si llegan ajustes de la cuenta (useSync), la lista se actualiza sola.
const saved = useState<string[] | null>('cities:selected', () => null)
const selected = computed(() => (saved.value ?? DEFAULT).filter(n => CITIES.some(c => c.name === n)))

/** Solo los cambios del usuario marcan los ajustes como modificados (y se sincronizan). */
function setCities(list: string[]) {
  saved.value = list
  writeStorage(settingsStorage.CITIES_KEY, list)
  touchSettings()
}

const now = ref<number>()
let timer: ReturnType<typeof setInterval> | undefined

// --- Convertir una hora ---
const baseCity = ref('Buenos Aires')
const date = ref('')
const time = ref('10:00')

onMounted(() => {
  if (saved.value === null) {
    const stored = readStorage<string[]>(settingsStorage.CITIES_KEY, [])
    if (stored.length) saved.value = stored
  }
  now.value = Date.now()
  timer = setInterval(() => (now.value = Date.now()), 15000)
  date.value = todayISO()
})
onUnmounted(() => clearInterval(timer))

const cityByName = (name: string) => CITIES.find(c => c.name === name)!
const available = computed(() => CITIES.filter(c => !selected.value.includes(c.name)))
const toAdd = ref('')
watch(toAdd, (name) => {
  if (name) {
    setCities([...selected.value, name])
    toAdd.value = ''
  }
})
const remove = (name: string) => setCities(selected.value.filter(n => n !== name))

const hm = (w: { h: number, min: number }) => `${String(w.h).padStart(2, '0')}:${String(w.min).padStart(2, '0')}`
const dayShort = (w: { y: number, m: number, d: number }) => new Date(Date.UTC(w.y, w.m - 1, w.d)).toLocaleDateString('es-AR', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' })

const instant = computed(() => {
  const d = parseISODate(date.value)
  const [h, min] = time.value.split(':').map(Number)
  if (!d || h === undefined || min === undefined || Number.isNaN(h) || Number.isNaN(min)) return undefined
  return zonedToInstant(d, h, min, cityByName(baseCity.value).tz)
})

function rows(ms: number | undefined) {
  if (ms === undefined) return []
  const baseOffset = zoneOffsetMinutes(ms, cityByName(baseCity.value).tz)
  return selected.value.map((name) => {
    const city = cityByName(name)
    const w = wallTime(ms, city.tz)
    const offset = zoneOffsetMinutes(ms, city.tz)
    const diffH = (offset - baseOffset) / 60
    return {
      city,
      time: hm(w),
      day: dayShort(w),
      offset: formatOffset(offset),
      diff: diffH === 0 ? 'misma hora' : `${diffH > 0 ? '+' : '−'}${Math.abs(diffH).toLocaleString('es-AR')} h`,
      work: w.h >= 9 && w.h < 18,
      night: w.h < 7 || w.h >= 22,
    }
  })
}

const nowRows = computed(() => rows(now.value))
const convertedRows = computed(() => rows(instant.value))

const inputClass = 'mt-1 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900 dark:scheme-dark'
</script>

<template>
  <ToolPage
    path="/husos-horarios"
    seo-title="Husos horarios: qué hora es en otra ciudad"
  >
    <section>
      <h2 class="text-lg font-semibold">
        Ahora en
      </h2>
      <ul class="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        <li
          v-for="row in nowRows"
          :key="row.city.name"
          class="flex items-center justify-between gap-3 px-4 py-2.5"
        >
          <span class="min-w-0">
            <span class="block truncate font-medium">{{ row.city.name }}</span>
            <span class="block text-xs text-slate-500">{{ row.city.country }} · {{ row.offset }}</span>
          </span>
          <span class="flex shrink-0 items-center gap-2">
            <span class="text-right">
              <span class="block text-xl font-semibold tabular-nums">{{ row.time }}</span>
              <span class="block text-xs text-slate-500">{{ row.day }}</span>
            </span>
            <button
              type="button"
              class="rounded p-1 text-slate-400 hover:text-red-600"
              :aria-label="`Quitar ${row.city.name}`"
              @click="remove(row.city.name)"
            >
              <AppIcon
                name="x"
                :size="16"
              />
            </button>
          </span>
        </li>
      </ul>
      <p
        v-if="!now"
        class="mt-2 text-sm text-slate-500"
      >
        Cargando la hora…
      </p>
      <label class="mt-3 block max-w-xs">
        <span class="sr-only">Agregar ciudad</span>
        <select
          v-model="toAdd"
          :class="inputClass"
        >
          <option value="">
            + Agregar ciudad
          </option>
          <option
            v-for="c in available"
            :key="c.name"
            :value="c.name"
          >
            {{ c.name }} ({{ c.country }})
          </option>
        </select>
      </label>
    </section>

    <section class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60">
      <h2 class="text-lg font-semibold">
        Convertir una hora
      </h2>
      <div class="grid gap-3 sm:grid-cols-3">
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Hora</span>
          <input
            v-model="time"
            type="time"
            :class="inputClass"
          >
        </label>
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Día</span>
          <input
            v-model="date"
            type="date"
            :class="inputClass"
          >
        </label>
        <label class="block min-w-0">
          <span class="text-sm font-medium text-slate-600 dark:text-slate-400">En</span>
          <select
            v-model="baseCity"
            :class="inputClass"
          >
            <option
              v-for="c in CITIES"
              :key="c.name"
              :value="c.name"
            >
              {{ c.name }}
            </option>
          </select>
        </label>
      </div>
      <ul class="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        <li
          v-for="row in convertedRows"
          :key="row.city.name"
          class="flex items-center justify-between gap-3 px-4 py-2.5"
        >
          <span class="min-w-0">
            <span class="block truncate font-medium">{{ row.city.name }}</span>
            <span class="block text-xs text-slate-500">{{ row.diff }}</span>
          </span>
          <span class="flex shrink-0 items-center gap-2 text-right">
            <span
              class="rounded-full px-2 py-0.5 text-xs"
              :class="row.work ? 'bg-brand-100 text-brand-900 dark:bg-brand-900/40 dark:text-brand-100' : row.night ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'"
            >{{ row.work ? 'laboral' : row.night ? 'noche' : 'fuera de horario' }}</span>
            <span>
              <span class="block text-lg font-semibold tabular-nums">{{ row.time }}</span>
              <span class="block text-xs text-slate-500">{{ row.day }}</span>
            </span>
          </span>
        </li>
      </ul>
      <p class="text-sm text-slate-500">
        Tiene en cuenta el horario de verano de cada país para el día elegido. «Laboral» es de 9 a 18 h.
      </p>
    </section>
  </ToolPage>
</template>
