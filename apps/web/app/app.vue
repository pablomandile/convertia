<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import 'vue-sonner/style.css'

const { isDark } = useTheme()

// Canónica sin query: /longitud/pies-a-metros?v=10 cuenta como /longitud/pies-a-metros.
const route = useRoute()
const { siteUrl } = useRuntimeConfig().public
useHead({
  link: [{ rel: 'canonical', href: computed(() => `${siteUrl}${route.path}`) }],
  meta: [{ property: 'og:url', content: computed(() => `${siteUrl}${route.path}`) }, { property: 'og:site_name', content: 'Convertia' }, { property: 'og:locale', content: 'es_AR' }],
})
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
