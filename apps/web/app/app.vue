<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const { isDark } = useTheme()
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster
      position="bottom-center"
      :theme="isDark ? 'dark' : 'light'"
      rich-colors
      :duration="2500"
    />
  </div>
</template>
