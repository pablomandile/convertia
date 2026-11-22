#!/usr/bin/env bash
# Deploy de Convertia (sitio estático) a Hostinger por SSH. El server no tiene Node: se compila acá.
#
#   scripts/deploy.sh            # build + subir + activar
#   SKIP_BUILD=1 scripts/deploy.sh
#
# Estructura en el server:
#   $ROOT/releases/<fecha>/   cada build (con api -> ../../api)
#   $ROOT/public              symlink al release activo (el docroot del subdominio apunta acá)
#   $ROOT/api/v1/             cotizaciones: las escribe el cron, NUNCA las toca el deploy
#   $ROOT/rates/fetch.php     el script del cron
#
# Cron de hPanel (una sola línea, sin "cd ... &&"):
#   /opt/alt/php84/usr/bin/php /home/u302133020/domains/bambudev.com.ar/convertia/rates/fetch.php --out=/home/u302133020/domains/bambudev.com.ar/convertia/api/v1 --quiet

set -euo pipefail

SSH_ALIAS="${SSH_ALIAS:-agendaflex}"
ROOT="${DEPLOY_ROOT:-/home/u302133020/domains/bambudev.com.ar/convertia}"
KEEP="${KEEP_RELEASES:-3}"
PHP="${REMOTE_PHP:-/opt/alt/php84/usr/bin/php}"

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "Hay cambios sin commitear: commiteá antes de desplegar (así producción nunca queda adelante del repo)." >&2
  exit 1
fi

# El build de producción usa apps/web/.env.production (NUNCA .env, que apunta al Supabase local).
# Para publicar sin cuentas, crearlo con las dos variables vacías.
test -f apps/web/.env.production || { echo "Falta apps/web/.env.production (ver apps/web/.env.example)." >&2; exit 1; }

if [ -z "${SKIP_BUILD:-}" ]; then
  npm run generate:prod -w apps/web
fi

DIST=apps/web/.output/public
test -f "$DIST/index.html" || { echo "No hay build en $DIST" >&2; exit 1; }
test ! -e "$DIST/api" || { echo "El build trae api/: pisaría las cotizaciones del cron" >&2; exit 1; }
if grep -rqE '127\.0\.0\.1:5432|localhost:5432' "$DIST" --include='*.html' --include='*.js'; then
  echo "El build apunta al Supabase LOCAL: se armó con .env en vez de .env.production. No se sube." >&2
  exit 1
fi

RELEASE="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
echo "→ Subiendo release $RELEASE a $SSH_ALIAS:$ROOT"

ssh "$SSH_ALIAS" "mkdir -p '$ROOT/releases/$RELEASE' '$ROOT/api/v1' '$ROOT/rates'"
tar -C "$DIST" -cf - . | ssh "$SSH_ALIAS" "tar -xf - -C '$ROOT/releases/$RELEASE'"
ssh "$SSH_ALIAS" "cat > '$ROOT/rates/fetch.php'" < rates/fetch.php

ssh "$SSH_ALIAS" "bash -s" <<EOF
set -euo pipefail
cd '$ROOT'
ln -sfn ../../api 'releases/$RELEASE/api'
test -f releases/$RELEASE/index.html

# Primera vez: bajar cotizaciones antes de activar, para que la app no arranque sin datos.
if [ ! -f api/v1/rates.json ]; then
  '$PHP' rates/fetch.php --out='$ROOT/api/v1' || true
fi

# Cambio atómico del symlink: nunca hay un instante sin sitio.
ln -sfn 'releases/$RELEASE' public.tmp
mv -T public.tmp public
echo "activo: \$(readlink public)"

# Limpiar releases viejos (quedan los últimos $KEEP).
ls -1d releases/*/ | sort | head -n -$KEEP | xargs -r rm -rf
ls -1 releases
EOF

echo "✓ Deploy listo: $RELEASE"
