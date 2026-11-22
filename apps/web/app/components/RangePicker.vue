<script setup lang="ts">
// Período del gráfico: una fila de opciones arriba del gráfico (skill dataviz, interacción).
const props = defineProps<{ max?: number }>()
const days = defineModel<number>({ required: true })
const options = computed(() => RANGES.filter(r => !props.max || r.days <= props.max + 5))
</script>

<template>
  <div
    class="flex flex-wrap gap-1"
    role="radiogroup"
    aria-label="Período"
  >
    <button
      v-for="r in options"
      :key="r.days"
      type="button"
      role="radio"
      :aria-checked="days === r.days"
      class="rounded-full border px-3 py-1 text-sm"
      :class="days === r.days ? 'border-brand-500 bg-brand-50 font-medium text-brand-900 dark:bg-brand-900/30 dark:text-brand-100' : 'border-slate-200 text-slate-600 hover:border-brand-500 dark:border-slate-700 dark:text-slate-300'"
      @click="days = r.days"
    >
      {{ r.label }}
    </button>
  </div>
</template>
