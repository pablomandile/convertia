import { createHash } from 'node:crypto'
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import { categories, pairSlug } from '@convertia/core'
import { currencyPairPath, popularCurrencyPairs } from './app/utils/popular'
import { BACKGROUND_COLOR, BRAND_COLOR, ICON_VERSION } from './app/utils/pwa'
import { tools } from './app/utils/tools'

// URL pública, para el sitemap y las URL canónicas.
const SITE_URL = (process.env.SITE_URL ?? 'https://convertia.bambudev.com.ar').replace(/\/$/, '')

// Rutas que se prerenderizan: cada categoría, sus pares populares y los pares de monedas populares.
// El resto de los pares se resuelve en el navegador vía 200.html (ver public/.htaccess).
const prerenderRoutes = [
  '/',
  '/monedas',
  ...categories.flatMap((category) => {
    const unit = (id: string) => category.units.find(u => u.id === id)!
    return [
      `/${category.slug}`,
      ...(category.popular ?? []).map(([from, to]) => `/${category.slug}/${pairSlug(unit(from), unit(to))}`),
    ]
  }),
  ...popularCurrencyPairs.map(([from, to]) => currencyPairPath(from, to)),
  ...tools.map(t => t.path),
  '/terminos',
  '/privacidad',
  '/cookies',
  '/cuenta',
]

function sitemap(routes: string[]): string {
  const today = new Date().toISOString().slice(0, 10)
  const urls = [...new Set(routes)].filter(r => r !== '/cuenta').sort().map(r => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod></url>`)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

const icon = (file: string) => `/icons/${file}?v=${ICON_VERSION}`

const manifest = {
  name: 'Convertia: unidades y monedas',
  short_name: 'Convertia',
  description: 'Convertí unidades, monedas y mucho más, al instante y sin conexión.',
  id: '/',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: BACKGROUND_COLOR,
  theme_color: BRAND_COLOR,
  lang: 'es-AR',
  dir: 'ltr',
  categories: ['utilities', 'productivity', 'finance'],
  icons: [
    { src: icon('icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: icon('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: icon('icon-maskable-512.png'), sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(e => e.isDirectory() ? listFiles(join(dir, e.name)) : [join(dir, e.name)]))
  return nested.flat()
}

// Se publica como sitio ESTÁTICO en Hostinger (sin Node): `nuxt generate` → .output/public
export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Convertia',
      titleTemplate: '%s · Convertia',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Convertí unidades, monedas y mucho más, al instante y sin conexión.' },
        { name: 'theme-color', content: BRAND_COLOR },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Convertia' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'icon', type: 'image/svg+xml', href: `/favicon.svg?v=${ICON_VERSION}` },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: icon('icon-192.png') },
        { rel: 'apple-touch-icon', href: icon('apple-touch-icon.png') },
      ],
      script: [
        // Tema antes de pintar, para que no parpadee al cargar en modo oscuro.
        {
          tagPosition: 'head',
          innerHTML: `try{var t=localStorage.getItem('convertia:theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
        },
        // Chrome dispara beforeinstallprompt antes de que monte Vue: se captura acá (skill adaptar-a-pwa §4).
        {
          tagPosition: 'head',
          innerHTML: `(function(){window.__pwaInstall={prompt:null,installed:false};window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaInstall.prompt=e;window.dispatchEvent(new CustomEvent('pwa:installable'))});window.addEventListener('appinstalled',function(){window.__pwaInstall.prompt=null;window.__pwaInstall.installed=true;window.dispatchEvent(new CustomEvent('pwa:installed'))})})();`,
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      ratesUrl: '/api/v1/rates.json',
      siteUrl: SITE_URL,
      // Cuentas (F3). Vacías = la app funciona igual, sin cuentas. Se fijan en el build (sitio estático).
      supabaseUrl: '',
      supabaseKey: '',
    },
  },

  experimental: {
    // Todo se calcula en el navegador: sin _payload.json, navegar sin conexión no depende de bajar nada.
    payloadExtraction: false,
  },
  compatibilityDate: '2025-07-15',

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      routes: prerenderRoutes,
    },
  },

  vite: {
    plugins: [tailwindcss()],
    // DEBUG_HYDRATION=1 npm run build → Vue explica cada diferencia de hidratación también en producción.
    define: { __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: process.env.DEBUG_HYDRATION === '1' },
  },

  hooks: {
    'nitro:build:public-assets': async (nitro) => {
      const publicDir = nitro.options.output.publicDir

      // public/api/ es la salida LOCAL del cron (solo desarrollo): no debe viajar en el build,
      // porque al subirlo pisaría las cotizaciones vivas que escribe el cron en producción.
      await rm(join(publicDir, 'api'), { recursive: true, force: true })

      await writeFile(join(publicDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2))
      await writeFile(join(publicDir, 'sitemap.xml'), sitemap(prerenderRoutes))
      await writeFile(join(publicDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

      // Service worker con la lista real de /_nuxt/ y un nombre de caché que cambia con el contenido.
      const assets = (await listFiles(join(publicDir, '_nuxt')))
        .map(f => '/' + relative(publicDir, f).split(sep).join('/'))
        .filter(p => /\.(js|css|woff2?)$/.test(p))
        .sort()
      const precache = ['/', '/200.html', '/manifest.webmanifest', ...manifest.icons.map(i => i.src), ...assets]
      const hash = createHash('sha256').update(JSON.stringify(precache)).digest('hex').slice(0, 10)
      const template = await readFile(join(nitro.options.rootDir, 'sw', 'sw.template.js'), 'utf8')
      const sw = template
        .replace(`'convertia-dev'`, `'convertia-${hash}'`)
        .replace('[/* PRECACHE */]', JSON.stringify(precache))
      if (sw.includes('convertia-dev') || sw.includes('/* PRECACHE */')) throw new Error('sw.template.js: no se encontraron los marcadores')
      await writeFile(join(publicDir, 'sw.js'), sw)
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
