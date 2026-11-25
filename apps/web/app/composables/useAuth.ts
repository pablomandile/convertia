import type { SupabaseClient, User } from '@supabase/supabase-js'
import { toast } from 'vue-sonner'

interface Profile {
  terms_version: string | null
  terms_accepted_at: string | null
}

/**
 * Sesión y cuenta. El acceso es con link mágico (o el código de 6 dígitos del mismo mail) y con Google.
 * La sincronización solo corre con los términos vigentes aceptados.
 */
export function useAuth() {
  const nuxtApp = useNuxtApp()
  const supabase = nuxtApp.$supabase as SupabaseClient | null
  const user = useState<User | null>('auth:user', () => null)
  const ready = useState('auth:ready', () => false)
  const profile = useState<Profile | null>('auth:profile', () => null)
  // Google aparece solo si está activado en el proyecto de Supabase (se consulta en el navegador, al
  // iniciar): así se prende o se apaga desde el panel, sin otro deploy. En el prerender es false.
  const googleEnabled = useState('auth:google', () => false)
  // Se acaba de entrar (volviendo del link, de Google o con el código): al terminar, al inicio. Si faltan
  // los términos, primero a /cuenta a aceptarlos (el link abre otra pestaña y la casilla no viaja).
  const justSignedIn = useState('auth:just-signed-in', () => false)
  const router = nuxtApp.$router

  // De la configuración y no del cliente: el cliente solo existe en el navegador, y esto tiene
  // que dar lo mismo en el prerender para no romper la hidratación.
  const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
  const enabled = !!(supabaseUrl && supabaseKey)
  const termsOk = computed(() => profile.value?.terms_version === LEGAL_VERSION)
  const needsTerms = computed(() => !!user.value && !!profile.value && !termsOk.value)

  async function loadProfile() {
    if (!supabase || !user.value) {
      profile.value = null
      return
    }
    const { data } = await supabase.from('profiles').select('terms_version, terms_accepted_at').eq('user_id', user.value.id).maybeSingle()
    profile.value = data ?? { terms_version: null, terms_accepted_at: null }

    // Si marcó la casilla antes de entrar (con el mail o con Google), la aceptación queda registrada ahora.
    if (!termsOk.value) {
      let pending: string | null = null
      try {
        pending = sessionStorage.getItem(PENDING_TERMS_KEY)
      }
      catch { /* sin sessionStorage */ }
      if (pending === LEGAL_VERSION) await acceptTerms()
    }
  }

  async function onSession(next: User | null) {
    const changed = next?.id !== user.value?.id
    user.value = next
    if (changed) await loadProfile()
    ready.value = true
    if (user.value && termsOk.value) useSync().syncNow()
    if (justSignedIn.value && user.value && profile.value) {
      if (termsOk.value) finishSignIn()
      else if (router.currentRoute.value.path !== '/cuenta') router.replace('/cuenta')
    }
  }

  function finishSignIn() {
    justSignedIn.value = false
    if (router.currentRoute.value.path !== '/') router.replace('/')
    toast.success('Entraste a tu cuenta', { description: user.value?.email ?? undefined })
  }

  let initialized = false
  function init(client: SupabaseClient) {
    if (initialized) return
    initialized = true
    // Vuelta del link o de Google (PKCE): la URL trae ?code=…, que supabase-js canjea por la sesión.
    if (new URLSearchParams(window.location.search).has('code')) justSignedIn.value = true
    fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseKey } })
      .then(r => (r.ok ? r.json() : null))
      .then((s) => { googleEnabled.value = s?.external?.google === true })
      .catch(() => { /* sin red: queda solo el mail */ })
    client.auth.getSession().then(({ data }) => onSession(data.session?.user ?? null))
    client.auth.onAuthStateChange((_event, session) => {
      // No usar await adentro del callback (lo recomienda supabase-js): se difiere.
      setTimeout(() => onSession(session?.user ?? null), 0)
    })
  }

  function rememberTermsChecked() {
    try {
      sessionStorage.setItem(PENDING_TERMS_KEY, LEGAL_VERSION)
    }
    catch { /* si no se puede, se pide en la pantalla de aceptación */ }
  }

  const redirectTo = () => `${window.location.origin}/`

  async function sendMagicLink(email: string) {
    if (!supabase) throw new Error('Las cuentas no están disponibles')
    rememberTermsChecked()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } })
    if (error) throw error
  }

  async function verifyCode(email: string, token: string) {
    if (!supabase) throw new Error('Las cuentas no están disponibles')
    justSignedIn.value = true
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) {
      justSignedIn.value = false
      throw error
    }
  }

  async function signInWithGoogle() {
    if (!supabase) throw new Error('Las cuentas no están disponibles')
    rememberTermsChecked()
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectTo() } })
    if (error) throw error
  }

  async function acceptTerms() {
    if (!supabase) return
    const { error } = await supabase.rpc('accept_terms', { version: LEGAL_VERSION })
    if (error) throw error
    try {
      sessionStorage.removeItem(PENDING_TERMS_KEY)
    }
    catch { /* nada */ }
    profile.value = { terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString() }
    useSync().syncNow()
    if (justSignedIn.value) finishSignIn()
  }

  async function signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    useSync().reset()
  }

  /** Borra la cuenta y todo lo guardado en ella, en el momento. Lo del dispositivo queda en el dispositivo. */
  async function deleteAccount() {
    if (!supabase) return
    const { error } = await supabase.rpc('delete_my_account')
    if (error) throw error
    await supabase.auth.signOut({ scope: 'local' })
    user.value = null
    profile.value = null
    useSync().reset()
  }

  /** Todo lo que la cuenta tiene guardado, en un JSON (derecho de acceso). */
  async function exportData() {
    if (!supabase || !user.value) throw new Error('Hace falta iniciar sesión')
    const [p, items, settings] = await Promise.all([
      supabase.from('profiles').select('*').eq('user_id', user.value.id).maybeSingle(),
      supabase.from('user_items').select('list, key, label, href, deleted, updated_at').order('updated_at', { ascending: false }),
      supabase.from('user_settings').select('data, updated_at').maybeSingle(),
    ])
    for (const r of [p, items, settings]) if (r.error) throw r.error
    return {
      exportedAt: new Date().toISOString(),
      account: {
        id: user.value.id,
        email: user.value.email,
        createdAt: user.value.created_at,
        providers: user.value.app_metadata?.providers ?? [],
        name: user.value.user_metadata?.full_name ?? null,
      },
      profile: p.data,
      favorites: (items.data ?? []).filter(i => i.list === 'favorites'),
      recent: (items.data ?? []).filter(i => i.list === 'recent'),
      settings: settings.data,
    }
  }

  return {
    enabled, googleEnabled, user, ready, profile, termsOk, needsTerms,
    init, sendMagicLink, verifyCode, signInWithGoogle, acceptTerms, signOut, deleteAccount, exportData,
  }
}
