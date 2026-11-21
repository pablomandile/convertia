// El evento beforeinstallprompt se captura en un script del <head> (nuxt.config.ts), porque
// Chrome lo dispara antes de que monte Vue. Acá solo se lee window.__pwaInstall.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
  interface Window {
    __pwaInstall?: { prompt: BeforeInstallPromptEvent | null, installed: boolean }
  }
  interface Navigator {
    standalone?: boolean
  }
}

const STANDALONE = '(display-mode: standalone)'

// iOS/iPadOS Safari nunca dispara beforeinstallprompt: la instalación es manual.
function detectIosSafari() {
  const ua = navigator.userAgent
  const isIosDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return isIosDevice && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
}

function detectInstalled() {
  return window.matchMedia?.(STANDALONE).matches === true
    || navigator.standalone === true
    || window.__pwaInstall?.installed === true
}

export function usePwaInstall() {
  const isInstalled = ref(true) // hasta montar no se sabe: no mostrar nada en el HTML prerenderizado
  const isIos = ref(false)
  // Queda en true aunque el prompt ya se haya usado, para caer en el instructivo y no dejar el botón muerto.
  const offered = ref(false)
  const canInstall = computed(() => !isInstalled.value && (offered.value || isIos.value))

  const onInstallable = () => (offered.value = true)
  const onInstalled = () => (isInstalled.value = true)
  const onDisplayModeChange = (e: MediaQueryListEvent) => (isInstalled.value = e.matches)
  let mq: MediaQueryList | undefined

  onMounted(() => {
    isInstalled.value = detectInstalled()
    isIos.value = detectIosSafari()
    offered.value = !!window.__pwaInstall?.prompt
    mq = window.matchMedia?.(STANDALONE)
    window.addEventListener('pwa:installable', onInstallable)
    window.addEventListener('pwa:installed', onInstalled)
    mq?.addEventListener?.('change', onDisplayModeChange)
  })
  onUnmounted(() => {
    window.removeEventListener('pwa:installable', onInstallable)
    window.removeEventListener('pwa:installed', onInstalled)
    mq?.removeEventListener?.('change', onDisplayModeChange)
  })

  async function install(): Promise<'accepted' | 'dismissed' | 'manual'> {
    const deferred = window.__pwaInstall?.prompt
    if (!deferred) return 'manual'
    window.__pwaInstall!.prompt = null // el evento sirve una sola vez
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    return outcome
  }

  return { canInstall, isInstalled, isIos, install }
}
