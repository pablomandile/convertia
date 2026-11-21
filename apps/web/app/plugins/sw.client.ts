// Registra el service worker (solo en el build; en desarrollo estorbaría con su caché).
export default defineNuxtPlugin(() => {
  if (import.meta.dev || !('serviceWorker' in navigator)) return
  const register = () => navigator.serviceWorker.register(`/sw.js?v=${SW_VERSION}`).catch(() => {})
  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
})
