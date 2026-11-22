import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Cliente de Supabase, solo en el navegador (el sitio es estático). Si no hay URL ni clave
// configuradas en el build, la app funciona igual y las cuentas quedan deshabilitadas.
export default defineNuxtPlugin((nuxtApp) => {
  const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
  const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: {
          flowType: 'pkce',
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'convertia:auth',
        },
      })
    : null

  // La sesión se conecta recién con la hidratación TERMINADA (onNuxtReady): con 'app:mounted' la página
  // todavía puede estar esperando su chunk (Suspense) y llegaba a hidratar con la sesión ya cargada,
  // distinta del HTML prerenderizado («Cargando…»). El contexto de sincronización se arma acá, con
  // Nuxt activo: después corre en timers y tras await (ver useSync).
  onNuxtReady(() => {
    nuxtApp.runWithContext(() => {
      useSync()
      if (supabase) useAuth().init(supabase)
    })
  })

  // Al volver la conexión o a la pestaña, traer lo que haya cambiado en otro dispositivo.
  const resync = () => nuxtApp.runWithContext(() => useSync().requestSync())
  window.addEventListener('online', resync)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') resync()
  })

  return { provide: { supabase } }
})
