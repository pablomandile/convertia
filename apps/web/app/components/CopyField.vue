<script setup lang="ts">
// Resultado de solo lectura con su etiqueta y un botón de copiar.
const props = defineProps<{
  label: string
  value: string
  /** Lo que se copia, si no es exactamente lo que se muestra (p. ej. sin espacios de agrupación). */
  copyValue?: string
  mono?: boolean
  large?: boolean
}>()

const { copy } = useShare()
</script>

<template>
  <div class="min-w-0">
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ props.label }}</span>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-brand-700 disabled:opacity-40 dark:hover:bg-slate-800"
        :disabled="!props.value"
        :aria-label="`Copiar ${props.label.toLowerCase()}`"
        @click="copy(props.copyValue ?? props.value)"
      >
        <AppIcon
          name="copy"
          :size="14"
        /> Copiar
      </button>
    </div>
    <output
      class="mt-1 block min-h-[2.75rem] w-full rounded-lg bg-brand-50 px-3 py-2 break-all text-brand-900 dark:bg-brand-900/30 dark:text-brand-100"
      :class="[props.mono && 'font-mono', props.large ? 'text-2xl font-semibold' : 'text-lg']"
      aria-live="polite"
    >{{ props.value || '—' }}</output>
  </div>
</template>
