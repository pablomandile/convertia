# Convertia

App web (PWA) para convertir unidades, monedas y mucho más. Nuxt 4 + TypeScript, publicada como sitio estático.

## Estructura

| Carpeta | Qué es |
|---|---|
| `packages/core` | Motor de conversión en TypeScript puro (sin Vue). Las unidades se definen como datos en `src/categories/`. |
| `apps/web` | La app Nuxt 4 (Tailwind v4). Se genera estática con `nuxt generate`. |
| `rates/` | (F1) Script PHP del cron que actualiza las cotizaciones en `/api/v1/rates.json`. |

## Comandos (desde la raíz)

```bash
npm install        # instala todo el monorepo
npm run dev        # app en http://localhost:3000
npm test           # tests del motor (Vitest)
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run build      # sitio estático en apps/web/.output/public
```

Requiere Node ≥ 22.21 (ver `.node-version`).

## Agregar una categoría de unidades

1. Crear `packages/core/src/categories/<slug>.ts` con un `CategoryDef` (unidad base + `factor` de cada unidad respecto de la base).
2. Sumarla en `packages/core/src/categories/index.ts`.
3. `npm test`: los tests genéricos verifican ida y vuelta A→B→A, ids únicos y pares populares.
