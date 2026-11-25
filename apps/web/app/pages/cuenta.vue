<script setup lang="ts">
import { toast } from 'vue-sonner'

useSeoMeta({ title: 'Mi cuenta', description: 'Tus favoritos y ajustes en todos tus dispositivos.', robots: 'noindex' })

const auth = useAuth()
const { user, ready, enabled, googleEnabled, needsTerms, profile } = auth
const { status, lastSync, syncNow } = useSync()
const { favorites } = useFavorites()
const { recent } = useRecent()

// --- Ingreso ---
const accepted = ref(false)
const email = ref('')
const code = ref('')
const sentTo = ref('')
const busy = ref(false)

const emailOk = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()))

async function withBusy(fn: () => Promise<unknown>, errorMessage: string) {
  if (busy.value) return
  busy.value = true
  try {
    await fn()
  }
  catch (error) {
    const message = (error as { message?: string })?.message
    toast.error(errorMessage, message ? { description: message } : undefined)
  }
  finally {
    busy.value = false
  }
}

function sendLink() {
  withBusy(async () => {
    await auth.sendMagicLink(email.value.trim())
    sentTo.value = email.value.trim()
    toast.success('Te mandamos el mail')
  }, 'No se pudo mandar el mail')
}

function enterWithCode() {
  withBusy(() => auth.verifyCode(sentTo.value, code.value.replace(/\D/g, '')), 'El código no es válido o venció')
}

function google() {
  withBusy(() => auth.signInWithGoogle(), 'No se pudo abrir Google')
}

// --- Aceptación (cuenta existente o textos actualizados) ---
const acceptNow = ref(false)
function accept() {
  withBusy(async () => {
    await auth.acceptTerms()
    toast.success('Listo, tu cuenta está activa')
  }, 'No se pudo registrar la aceptación')
}

// --- Cuenta ---
function download() {
  withBusy(async () => {
    const data = await auth.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `convertia-mis-datos-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, 'No se pudieron descargar los datos')
}

function signOut() {
  withBusy(async () => {
    await auth.signOut()
    toast('Cerraste la sesión')
  }, 'No se pudo cerrar la sesión')
}

const confirmDelete = ref(false)
function deleteAccount() {
  withBusy(async () => {
    await auth.deleteAccount()
    confirmDelete.value = false
    toast.success('Eliminamos tu cuenta y sus datos')
  }, 'No se pudo eliminar la cuenta')
}

const route = useRoute()
watch(() => route.fullPath, () => (confirmDelete.value = false))
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') confirmDelete.value = false
}
onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))

const syncText = computed(() => {
  if (status.value === 'syncing') return 'Sincronizando…'
  if (status.value === 'offline') return 'Sin conexión: se sincroniza al volver'
  if (status.value === 'error') return 'No se pudo sincronizar'
  if (lastSync.value) return `Sincronizado a las ${new Date(lastSync.value).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`
  return 'Sincronizando…'
})

const name = computed(() => user.value?.user_metadata?.full_name as string | undefined)
const isFirstTime = computed(() => !profile.value?.terms_version)

const card = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900/60'
const primary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-4 font-medium text-white hover:bg-brand-600 disabled:opacity-50'
const secondary = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 font-medium hover:border-brand-500 disabled:opacity-50 dark:border-slate-700'
</script>

<template>
  <div class="mx-auto max-w-lg space-y-6">
    <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">
      Mi cuenta
    </h1>

    <!-- Cuentas deshabilitadas en este build -->
    <p
      v-if="!enabled"
      :class="card"
    >
      Las cuentas todavía no están disponibles. Tus favoritos y ajustes se guardan en este dispositivo.
    </p>

    <p
      v-else-if="!ready"
      class="text-slate-500"
    >
      Cargando…
    </p>

    <!-- Ingreso -->
    <template v-else-if="!user">
      <p class="text-slate-600 dark:text-slate-400">
        Con una cuenta tenés tus favoritos y ajustes en todos tus dispositivos. Es opcional: Convertia funciona igual sin cuenta.
      </p>
      <section
        :class="card"
        class="space-y-4"
      >
        <label class="flex items-start gap-2.5 text-sm">
          <input
            v-model="accepted"
            type="checkbox"
            required
            class="mt-0.5 size-5 shrink-0 accent-brand-700"
          >
          <span>
            Acepto los <a
              href="/terminos"
              target="_blank"
              class="text-brand-700 underline dark:text-brand-500"
            >términos y condiciones</a> y la <a
              href="/privacidad"
              target="_blank"
              class="text-brand-700 underline dark:text-brand-500"
            >política de privacidad</a>.
          </span>
        </label>

        <template v-if="!sentTo">
          <template v-if="googleEnabled">
            <button
              type="button"
              :class="secondary"
              class="w-full"
              :disabled="!accepted || busy"
              @click="google"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
              ><path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              /><path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              /><path
                fill="#FBBC05"
                d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z"
              /><path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              /></svg>
              Entrar con Google
            </button>
            <div class="flex items-center gap-3 text-sm text-slate-500">
              <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700" /> o con tu email <span class="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </div>
          </template>
          <form
            class="space-y-3"
            @submit.prevent="sendLink"
          >
            <label class="block">
              <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Email</span>
              <input
                v-model="email"
                type="email"
                autocomplete="email"
                inputmode="email"
                required
                class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900"
              >
            </label>
            <button
              type="submit"
              :class="primary"
              class="w-full"
              :disabled="!accepted || !emailOk || busy"
            >
              Enviarme el link
            </button>
          </form>
          <p class="text-xs text-slate-500">
            Sin contraseñas: te llega un link y un código de 6 dígitos para entrar.
          </p>
        </template>

        <form
          v-else
          class="space-y-3"
          @submit.prevent="enterWithCode"
        >
          <p>
            Te mandamos un mail a <strong class="wrap-anywhere">{{ sentTo }}</strong>. Tocá el link, o escribí acá el código de 6 dígitos (sirve si usás la app instalada).
          </p>
          <label class="block">
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Código</span>
            <input
              v-model="code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              class="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center font-mono text-2xl tracking-[0.4em] dark:border-slate-700 dark:bg-slate-900"
            >
          </label>
          <button
            type="submit"
            :class="primary"
            class="w-full"
            :disabled="code.replace(/\D/g, '').length !== 6 || busy"
          >
            Entrar
          </button>
          <button
            type="button"
            class="w-full text-sm text-slate-500 underline"
            @click="sentTo = ''; code = ''"
          >
            Usar otro email
          </button>
        </form>
      </section>
    </template>

    <!-- Aceptar y continuar -->
    <section
      v-else-if="needsTerms"
      :class="card"
      class="space-y-4"
    >
      <h2 class="text-lg font-semibold">
        {{ isFirstTime ? 'Antes de seguir' : 'Actualizamos los términos' }}
      </h2>
      <p class="text-slate-700 dark:text-slate-300">
        <template v-if="isFirstTime">
          Para sincronizar tus favoritos y ajustes necesitamos que aceptes los términos y la política de privacidad.
        </template>
        <template v-else>
          Cambiamos los términos o la política de privacidad. Revisalos y aceptalos para seguir sincronizando.
        </template>
      </p>
      <label class="flex items-start gap-2.5 text-sm">
        <input
          v-model="acceptNow"
          type="checkbox"
          class="mt-0.5 size-5 shrink-0 accent-brand-700"
        >
        <span>
          Acepto los <a
            href="/terminos"
            target="_blank"
            class="text-brand-700 underline dark:text-brand-500"
          >términos y condiciones</a> y la <a
            href="/privacidad"
            target="_blank"
            class="text-brand-700 underline dark:text-brand-500"
          >política de privacidad</a>.
        </span>
      </label>
      <button
        type="button"
        :class="primary"
        class="w-full"
        :disabled="!acceptNow || busy"
        @click="accept"
      >
        Aceptar y continuar
      </button>
      <div class="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
        <button
          type="button"
          class="underline"
          @click="download"
        >
          Descargar mis datos
        </button>
        <button
          type="button"
          class="text-red-700 underline dark:text-red-400"
          @click="confirmDelete = true"
        >
          Eliminar cuenta
        </button>
        <button
          type="button"
          class="underline"
          @click="signOut"
        >
          Salir
        </button>
      </div>
    </section>

    <!-- Cuenta activa -->
    <template v-else>
      <section
        :class="card"
        class="space-y-3"
      >
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Entraste como
        </p>
        <p class="text-lg font-semibold wrap-anywhere">
          {{ name ? `${name} · ` : '' }}{{ user.email }}
        </p>
        <p class="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <span>{{ syncText }}</span>
          <button
            type="button"
            class="underline"
            :disabled="status === 'syncing'"
            @click="syncNow()"
          >
            Sincronizar ahora
          </button>
        </p>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          {{ favorites.length }} {{ favorites.length === 1 ? 'favorito' : 'favoritos' }} · {{ recent.length }} recientes
        </p>
      </section>

      <section class="flex flex-wrap gap-2">
        <button
          type="button"
          :class="secondary"
          :disabled="busy"
          @click="download"
        >
          Descargar mis datos
        </button>
        <button
          type="button"
          :class="secondary"
          :disabled="busy"
          @click="signOut"
        >
          Cerrar sesión
        </button>
        <button
          type="button"
          class="inline-flex min-h-11 items-center rounded-lg px-4 font-medium text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
          @click="confirmDelete = true"
        >
          Eliminar cuenta
        </button>
      </section>
      <p class="text-sm text-slate-500">
        Al cerrar la sesión, lo guardado en este dispositivo queda acá. Más detalles en la <NuxtLink
          to="/privacidad"
          class="underline"
        >política de privacidad</NuxtLink>.
      </p>
    </template>

    <Teleport to="body">
      <div
        v-if="confirmDelete"
        class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
        @click.self="confirmDelete = false"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          aria-describedby="delete-desc"
          class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900"
        >
          <h2
            id="delete-title"
            class="text-lg font-semibold"
          >
            ¿Eliminar tu cuenta?
          </h2>
          <p
            id="delete-desc"
            class="mt-2 text-slate-700 dark:text-slate-300"
          >
            Se borran en el momento tu cuenta, tus favoritos, tus recientes y tus ajustes guardados en ella. No se puede deshacer.
            Lo guardado en este dispositivo queda acá.
          </p>
          <div class="mt-5 flex flex-col gap-2">
            <button
              type="button"
              class="min-h-11 rounded-lg bg-red-700 px-4 font-medium text-white hover:bg-red-600 disabled:opacity-50"
              :disabled="busy"
              @click="deleteAccount"
            >
              Eliminar definitivamente
            </button>
            <button
              type="button"
              :class="secondary"
              @click="confirmDelete = false"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
