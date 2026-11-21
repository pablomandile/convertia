import tailwindcss from '@tailwindcss/vite'

// Se publica como sitio ESTÁTICO en Hostinger (sin Node): `nuxt generate` → .output/public
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Convertia',
      meta: [
        { name: 'description', content: 'Convertí unidades, monedas y mucho más, al instante y sin conexión.' },
        { name: 'theme-color', content: '#0f766e' },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2025-07-15',

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: ['/'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
