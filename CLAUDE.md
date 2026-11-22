# Convertia

App de conversiones (unidades, monedas, herramientas) en **Nuxt 4 + TypeScript**, publicada como **sitio estático** en Hostinger (sin Node en el server). Monorepo npm: `packages/core` (motor puro, con tests), `apps/web` (Nuxt), `rates/` (cron PHP), `supabase/` (cuentas).

## Reglas que no son obvias

- **Todo lo dinámico corre en el navegador.** Nada de rutas server de Nuxt ni SSR en producción. Lo que depende de "ahora" o del dispositivo (fecha, localStorage, sesión) se lee en `onMounted`/`onNuxtReady`, nunca en el render: el HTML prerenderizado tiene que coincidir con el primer render del cliente (el e2e falla con cualquier diferencia de hidratación; `DEBUG_HYDRATION=1 npm run build` muestra el detalle).
- **La lógica va en `packages/core`** con tests; las páginas solo la usan.
- **Cotizaciones e IPC** los baja `rates/fetch.php` (cron de hPanel) a `/api/v1/*.json`. En local: `npm run rates`. `public/api/` nunca viaja en el build.
- **Service worker** generado en el build (`apps/web/sw/sw.template.js`): cache-first solo para `/_nuxt/`. Todo lo demás, network-first.
- **Commits**: mensajes en español; deploy con `bash scripts/deploy.sh` (exige árbol limpio y `apps/web/.env.production`).

## Cuentas (Supabase)

- Cliente solo en el navegador (`plugins/supabase.client.ts`), sesión conectada en `onNuxtReady`.
- Seguridad en la base: RLS por `auth.uid()`, `CHECK` de tamaños y de `href` internos, tope de 500 ítems, constancia de términos solo por `accept_terms()`, borrado real por `delete_my_account()` (cascada). Migraciones en `supabase/migrations/`.
- Sincronización local-first (`core/sync.ts` + `composables/useSync.ts`): gana lo más nuevo por ítem; los borrados son lápidas que duran `TOMBSTONE_DAYS`. `useSync` captura su contexto una vez porque corre en timers y tras `await`.
- `.env` = Supabase local (desarrollo); `.env.production` = la nube. El deploy corta si el build trae una URL local.

## Textos legales (`apps/web/content/legal/*.md`)

Cada frase tiene que poder señalarse en el código. `npm test` (scripts/check-legal.mjs) lo verifica:

| El texto dice | Lo sostiene |
|---|---|
| Inventario de `/cookies` | Toda clave `convertia:*` del código y la caché del SW (el test falla si aparece una nueva sin declarar) |
| Borrados: marca por **60 días** | `TOMBSTONE_DAYS` en `core/sync.ts` |
| Recientes: **últimas 12** | `SAVED_LIMITS.recent` en `useSaved.ts` |
| «Descargar mis datos» y «Eliminar cuenta» | Botones de `/cuenta` (también en la pantalla de aceptación) |
| Borrado inmediato | `on delete cascade` + `delete_my_account()` |
| Supabase en São Paulo | Región del proyecto en la nube |
| Contacto y edad mínima (13) | `LEGAL_CONTACT` en `utils/legal.ts`, los dos textos |

**Si un cambio modifica lo que se promete, cambiar el texto y subir `LEGAL_VERSION`** (`utils/legal.ts`): vuelve a pedir la aceptación a todos. El aviso de cookies es **informativo** porque todo lo guardado es necesario; si entra algo no necesario (analíticas, widgets de terceros), pasa a consentimiento previo y se sube su versión en `CookieNotice.vue`.

## Verificación

```bash
npm run lint && npm run typecheck && npm test   # motor + textos legales
npm run build && npm run e2e                    # Chrome: PWA, herramientas, sin conexión, desborde
npm run db:start && npm run test:db             # RLS con dos usuarios reales (Supabase local)
npm run build && node apps/web/scripts/e2e-cuentas.mjs   # cuentas de punta a punta (Mailpit)
```
