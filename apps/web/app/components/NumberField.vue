<script setup lang="ts">
import { parseNumber } from '@convertia/core'

// Campo numérico con la convención argentina (1.500,25). Emite el texto; el número sale de `parsed`.
const props = defineProps<{
  label: string
  prefix?: string
  suffix?: string
  hint?: string
  large?: boolean
}>()

const model = defineModel<string>({ required: true })
const id = useId()
const invalid = computed(() => model.value.trim() !== '' && !parseNumber(model.value))
</script>

<template>
  <div class="min-w-0">
    <label
      :for="id"
      class="block text-sm font-medium text-slate-600 dark:text-slate-400"
    >{{ props.label }}</label>
    <div
      class="mt-1 flex items-center rounded-lg border bg-white px-3 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/30 dark:bg-slate-900"
      :class="invalid ? 'border-red-400' : 'border-slate-300 dark:border-slate-700'"
    >
      <span
        v-if="props.prefix"
        class="mr-1.5 text-slate-500"
      >{{ props.prefix }}</span>
      <input
        :id="id"
        v-model="model"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        class="w-full min-w-0 bg-transparent py-2.5 tabular-nums outline-none"
        :class="props.large ? 'text-2xl font-semibold' : 'text-lg'"
        :aria-invalid="invalid"
        :aria-describedby="props.hint ? `${id}-hint` : undefined"
      >
      <span
        v-if="props.suffix"
        class="ml-1.5 shrink-0 text-slate-500"
      >{{ props.suffix }}</span>
    </div>
    <p
      v-if="props.hint"
      :id="`${id}-hint`"
      class="mt-1 text-xs text-slate-500"
    >
      {{ props.hint }}
    </p>
  </div>
</template>
