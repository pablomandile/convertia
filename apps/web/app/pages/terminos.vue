<script setup lang="ts">
import source from '~~/content/legal/terminos.md?raw'
</script>

<template>
  <LegalPage
    :source="source"
    title="Términos y condiciones"
    description="Las condiciones de uso de Convertia."
    versioned
  />
</template>
