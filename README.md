# Convertia

App web (PWA instalable) para convertir unidades, monedas y mucho más. Nuxt 4 + TypeScript, publicada como sitio estático en Hostinger. Funciona sin conexión.

## Estructura

| Carpeta | Qué es |
|---|---|
| `packages/core` | Motor en TypeScript puro (sin Vue): 15 categorías de unidades como datos (`src/categories/`), parser de la barra inteligente, slugs para URLs y conversión de monedas. |
| `apps/web` | La app Nuxt 4 (Tailwind v4). `nuxt generate` → `.output/public`, con el service worker y el manifest generados en el build. |
| `rates/fetch.php` | Cron que baja cotizaciones (ExchangeRate-API, CoinGecko, DolarApi) y publica `/api/v1/rates.json`. También es la API pública. |

## Comandos (desde la raíz)

```bash
npm install        # instala todo el monorepo
npm run rates      # baja cotizaciones a apps/web/public/api/v1 (solo para desarrollo; no viaja en el build)
npm run dev        # app en http://localhost:3000
npm test           # tests del motor (Vitest)
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # sitio estático en apps/web/.output/public
npm run serve      # sirve el build como el .htaccess de Hostinger (200.html de respaldo)
npm run e2e        # verificación con Chrome: PWA instalable, barra, sin conexión, desborde en 320/390 px
npm run icons      # regenera los íconos desde apps/web/icons-src/*.svg
```

Requiere Node ≥ 22.21 (ver `.node-version`), PHP 8 para el cron, y Chrome para `e2e` e `icons`.

## Agregar una categoría de unidades

1. Crear `packages/core/src/categories/<slug>.ts` con un `CategoryDef` (unidad base + `factor` de cada unidad respecto de la base; admite fracciones `"5/9"`, `offset` para escalas afines e `inverse` para escalas inversas).
2. Sumarla en `packages/core/src/categories/index.ts`.
3. `npm test`: los tests genéricos verifican ida y vuelta A→B→A, ids y slugs únicos, y pares populares.

La página, las rutas prerenderizadas (pares `popular`) y el parser la toman solos.

## Producción (Hostinger, sin Node)

- Se compila en local y se sube `apps/web/.output/public` al `public_html` del dominio, **sin pisar `api/`**, que la escribe el cron.
- Cron de hPanel (sin `cd ... &&`, que el ejecutor no soporta):
  `/usr/bin/php /home/<usuario>/convertia/rates/fetch.php --out=/home/<usuario>/domains/<dominio>/public_html/api/v1 --quiet`
- Al cambiar íconos: `npm run icons` y subir `ICON_VERSION` en `apps/web/app/utils/pwa.ts`.
