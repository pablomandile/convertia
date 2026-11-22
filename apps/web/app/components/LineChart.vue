<script setup lang="ts">
import { monthlyLast, niceTicks, type Series } from '@convertia/core'

// Gráfico de líneas en SVG, sin librería (anda sin conexión y no suma peso).
// Según la skill dataviz: colores categóricos en orden fijo (validados contra nuestros fondos),
// líneas de 2px, grilla de 1px, etiquetas directas al final (si no se pisan), leyenda con 2+ series,
// cruz + tooltip al pasar el puntero, texto siempre en tinta (nunca del color de la serie)
// y una vista en tabla. Los slots 3 y 4 no llegan a 3:1 en claro: por eso etiquetas + tabla.

export interface ChartSeries {
  id: string
  name: string
  /** Slot categórico 1–4 (fijo por entidad: no cambia si se ocultan otras series). */
  slot: 1 | 2 | 3 | 4
  points: Series
}

const props = withDefaults(defineProps<{
  series: ChartSeries[]
  /** Formato de los valores (eje, etiquetas y tooltip). */
  format: (n: number) => string
  /** Descripción para lectores de pantalla. */
  label: string
  height?: number
}>(), { height: 240 })

const root = ref<HTMLElement>()
const width = ref(0)
let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => (width.value = Math.round(entry!.contentRect.width)))
  if (root.value) observer.observe(root.value)
})
onUnmounted(() => observer?.disconnect())

const PAD = { top: 12, right: 12, bottom: 26, left: 56 }
// Espacio a la derecha para las etiquetas directas, si entran.
const labelSpace = computed(() => width.value >= 420 ? 92 : 0)
const plotW = computed(() => Math.max(0, width.value - PAD.left - PAD.right - labelSpace.value))
const plotH = computed(() => props.height - PAD.top - PAD.bottom)

const visible = computed(() => props.series.filter(s => s.points.length > 1))
const dates = computed(() => [...new Set(visible.value.flatMap(s => s.points.map(([d]) => d)))].sort())
const t = (d: string) => Date.parse(d)
const domainX = computed(() => [t(dates.value[0] ?? '1970-01-01'), t(dates.value.at(-1) ?? '1970-01-02')] as const)
const domainY = computed(() => {
  const values = visible.value.flatMap(s => s.points.map(([, v]) => v))
  if (!values.length) return [0, 1] as const
  const min = Math.min(...values)
  const max = Math.max(...values)
  const pad = (max - min) * 0.08 || Math.abs(max) * 0.05 || 1
  return [min - pad, max + pad] as const
})
const x = (d: string) => PAD.left + (t(d) - domainX.value[0]) / Math.max(1, domainX.value[1] - domainX.value[0]) * plotW.value
const y = (v: number) => PAD.top + (1 - (v - domainY.value[0]) / (domainY.value[1] - domainY.value[0])) * plotH.value

const yTicks = computed(() => niceTicks(domainY.value[0], domainY.value[1], 4))
const xTicks = computed(() => {
  const ds = dates.value
  if (ds.length < 2) return []
  const count = Math.max(2, Math.min(6, Math.floor(plotW.value / 90)))
  const step = (ds.length - 1) / (count - 1)
  return Array.from({ length: count }, (_, i) => ds[Math.round(i * step)]!)
})
const spanDays = computed(() => (domainX.value[1] - domainX.value[0]) / 86400000)
const xLabel = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-AR', spanDays.value > 120 ? { month: 'short', year: '2-digit', timeZone: 'UTC' } : { day: 'numeric', month: 'short', timeZone: 'UTC' })

const paths = computed(() => visible.value.map(s => ({
  ...s,
  d: s.points.map(([d, v], i) => `${i ? 'L' : 'M'}${x(d).toFixed(1)},${y(v).toFixed(1)}`).join(''),
})))

// Etiquetas directas al final: solo las que no se pisan (si se juntan, quedan la leyenda y el tooltip).
const endLabels = computed(() => {
  if (!labelSpace.value) return []
  const items = visible.value.map(s => ({ s, y: y(s.points.at(-1)![1]), x: x(s.points.at(-1)![0]) })).sort((a, b) => a.y - b.y)
  return items.filter((it, i) => (i === 0 || it.y - items[i - 1]!.y >= 30) && (i === items.length - 1 || items[i + 1]!.y - it.y >= 30))
})

// --- Hover ---
const hoverDate = ref<string | null>(null)
function onMove(e: PointerEvent) {
  const svg = e.currentTarget as SVGSVGElement
  const rect = svg.getBoundingClientRect()
  const px = e.clientX - rect.left
  const target = domainX.value[0] + (px - PAD.left) / Math.max(1, plotW.value) * (domainX.value[1] - domainX.value[0])
  let best: string | null = null
  let bestDist = Infinity
  for (const d of dates.value) {
    const dist = Math.abs(t(d) - target)
    if (dist < bestDist) {
      best = d
      bestDist = dist
    }
  }
  hoverDate.value = best
}
const hover = computed(() => {
  if (!hoverDate.value) return null
  const rows = visible.value
    .map(s => ({ s, v: s.points.find(([d]) => d === hoverDate.value)?.[1] }))
    .filter((r): r is { s: ChartSeries, v: number } => r.v !== undefined)
  return { date: hoverDate.value, x: x(hoverDate.value), rows }
})
const tooltipLeft = computed(() => hover.value ? Math.min(Math.max(hover.value.x - 80, 0), width.value - 170) : 0)

// --- Tabla ---
const showTable = ref(false)
const tableRows = computed(() => {
  const base = visible.value[0]
  if (!base) return []
  return monthlyLast(base.points).reverse().map(([d]) => ({
    date: d,
    values: visible.value.map((s) => {
      const month = d.slice(0, 7)
      const inMonth = s.points.filter(([pd]) => pd.startsWith(month))
      return inMonth.at(-1)?.[1]
    }),
  }))
})
const longDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const monthLabel = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
</script>

<template>
  <div class="viz">
    <!-- Leyenda (2 o más series): clave de línea + nombre en tinta -->
    <ul
      v-if="visible.length > 1"
      class="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300"
    >
      <li
        v-for="s in visible"
        :key="s.id"
        class="flex items-center gap-1.5"
      >
        <span
          class="inline-block h-0.5 w-4 rounded-full"
          :style="{ background: `var(--series-${s.slot})` }"
          aria-hidden="true"
        />
        {{ s.name }}
      </li>
    </ul>

    <div
      ref="root"
      class="relative w-full"
      :style="{ height: `${props.height}px` }"
    >
      <svg
        v-if="width && visible.length"
        :width="width"
        :height="props.height"
        role="img"
        :aria-label="props.label"
        class="block touch-pan-y select-none"
        @pointermove="onMove"
        @pointerdown="onMove"
        @pointerleave="hoverDate = null"
      >
        <!-- Grilla y eje Y -->
        <g>
          <template
            v-for="tick in yTicks"
            :key="tick"
          >
            <line
              :x1="PAD.left"
              :x2="PAD.left + plotW"
              :y1="y(tick)"
              :y2="y(tick)"
              class="stroke-[var(--grid)]"
              stroke-width="1"
            />
            <text
              :x="PAD.left - 8"
              :y="y(tick)"
              text-anchor="end"
              dominant-baseline="middle"
              class="fill-[var(--muted)] text-[11px] tabular-nums"
            >{{ props.format(tick) }}</text>
          </template>
          <!-- La primera y la última fecha se alinean hacia adentro, para que no se corten en el borde. -->
          <text
            v-for="(d, i) in xTicks"
            :key="d"
            :x="x(d)"
            :y="props.height - 8"
            :text-anchor="i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'"
            class="fill-[var(--muted)] text-[11px]"
          >{{ xLabel(d) }}</text>
        </g>

        <!-- Líneas -->
        <path
          v-for="p in paths"
          :key="p.id"
          :d="p.d"
          fill="none"
          :stroke="`var(--series-${p.slot})`"
          stroke-width="2"
          stroke-linejoin="round"
          stroke-linecap="round"
        />

        <!-- Etiquetas directas -->
        <g
          v-for="l in endLabels"
          :key="l.s.id"
        >
          <text
            :x="l.x + 8"
            :y="l.y - 6"
            class="fill-[var(--ink)] text-[11px] font-medium"
          >{{ l.s.name }}</text>
          <text
            :x="l.x + 8"
            :y="l.y + 8"
            class="fill-[var(--muted)] text-[11px] tabular-nums"
          >{{ props.format(l.s.points.at(-1)![1]) }}</text>
        </g>

        <!-- Cruz + puntos con anillo del color de fondo -->
        <g v-if="hover">
          <line
            :x1="hover.x"
            :x2="hover.x"
            :y1="PAD.top"
            :y2="PAD.top + plotH"
            class="stroke-[var(--axis)]"
            stroke-width="1"
          />
          <circle
            v-for="r in hover.rows"
            :key="r.s.id"
            :cx="hover.x"
            :cy="y(r.v)"
            r="4.5"
            :fill="`var(--series-${r.s.slot})`"
            class="stroke-[var(--surface)]"
            stroke-width="2"
          />
        </g>
      </svg>

      <div
        v-if="hover"
        class="pointer-events-none absolute top-0 z-10 w-[170px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-900"
        :style="{ left: `${tooltipLeft}px` }"
      >
        <p class="font-medium text-slate-900 dark:text-slate-100">
          {{ longDate(hover.date) }}
        </p>
        <p
          v-for="r in hover.rows"
          :key="r.s.id"
          class="mt-0.5 flex items-center justify-between gap-2 text-slate-600 dark:text-slate-300"
        >
          <span class="flex items-center gap-1.5">
            <span
              class="inline-block size-2 rounded-full"
              :style="{ background: `var(--series-${r.s.slot})` }"
              aria-hidden="true"
            />{{ r.s.name }}
          </span>
          <span class="font-medium text-slate-900 tabular-nums dark:text-slate-100">{{ props.format(r.v) }}</span>
        </p>
      </div>
    </div>

    <button
      type="button"
      class="mt-2 text-sm text-slate-600 underline dark:text-slate-400"
      :aria-expanded="showTable"
      @click="showTable = !showTable"
    >
      {{ showTable ? 'Ocultar tabla' : 'Ver como tabla' }}
    </button>
    <div
      v-if="showTable"
      class="mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-slate-800"
    >
      <table class="w-full text-left text-sm tabular-nums">
        <thead class="sticky top-0 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
          <tr>
            <th class="px-3 py-2 font-medium">
              Fin de mes
            </th>
            <th
              v-for="s in visible"
              :key="s.id"
              class="px-3 py-2 text-right font-medium"
            >
              {{ s.name }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="row in tableRows"
            :key="row.date"
          >
            <td class="px-3 py-1.5">
              {{ monthLabel(row.date) }}
            </td>
            <td
              v-for="(v, i) in row.values"
              :key="i"
              class="px-3 py-1.5 text-right"
            >
              {{ v === undefined ? '—' : props.format(v) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
/* Paleta categórica de referencia (skill dataviz), validada contra nuestros fondos (#fff y slate-950). */
.viz {
  --series-1: #2a78d6;
  --series-2: #eb6834;
  --series-3: #1baf7a;
  --series-4: #eda100;
  --ink: #0f172a;
  --muted: #64748b;
  --grid: #e2e8f0;
  --axis: #94a3b8;
  --surface: #ffffff;
}
.dark .viz {
  --series-1: #3987e5;
  --series-2: #d95926;
  --series-3: #199e70;
  --series-4: #c98500;
  --ink: #f1f5f9;
  --muted: #94a3b8;
  --grid: #1e293b;
  --axis: #475569;
  --surface: #020617;
}
</style>
