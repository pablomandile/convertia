// Ajustes que viajan con la cuenta: el tema y las ciudades de husos horarios.
// Cada uno se guarda en su clave de localStorage; una fecha común dice cuándo cambió el conjunto,
// para que la sincronización sepa qué versión es la más nueva.

const THEME_KEY = 'convertia:theme'
const CITIES_KEY = 'convertia:cities'
const UPDATED_KEY = 'convertia:settings-updated'

export interface SettingsData {
  theme?: 'dark' | 'light'
  cities?: string[]
}

export interface SettingsRefs {
  dark: Ref<boolean>
  cities: Ref<string[] | null>
}

/** El estado compartido que muestran el botón de tema y la página de husos horarios. */
export function useSettingsRefs(): SettingsRefs {
  return {
    dark: useState('theme:dark', () => false),
    cities: useState<string[] | null>('cities:selected', () => null),
  }
}

// El tema va como texto plano (no JSON): lo lee el script del <head> antes de pintar.
function readTheme(): 'dark' | 'light' | undefined {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'dark' || t === 'light' ? t : undefined
  }
  catch {
    return undefined
  }
}

function writeTheme(theme: 'dark' | 'light') {
  try {
    localStorage.setItem(THEME_KEY, theme)
  }
  catch { /* sin almacenamiento: el tema dura hasta recargar */ }
}

export function readLocalSettings(): { data: SettingsData, updatedAt: string } | undefined {
  const updatedAt = readStorage<string | null>(UPDATED_KEY, null)
  if (!updatedAt) return undefined
  const data: SettingsData = {}
  const theme = readTheme()
  if (theme) data.theme = theme
  const cities = readStorage<string[] | null>(CITIES_KEY, null)
  if (Array.isArray(cities)) data.cities = cities
  return { data, updatedAt }
}

/** Marca que los ajustes cambiaron en este dispositivo (y pide sincronizar). */
export function touchSettings() {
  writeStorage(UPDATED_KEY, new Date().toISOString())
  useSync().requestSync()
}

/** Aplica ajustes que llegaron de la cuenta. */
export function applyRemoteSettings(remote: { data: SettingsData, updatedAt: string }, refs: SettingsRefs) {
  if (remote.data.theme) {
    writeTheme(remote.data.theme)
    refs.dark.value = remote.data.theme === 'dark'
    document.documentElement.classList.toggle('dark', remote.data.theme === 'dark')
  }
  if (Array.isArray(remote.data.cities)) {
    writeStorage(CITIES_KEY, remote.data.cities)
    refs.cities.value = remote.data.cities
  }
  writeStorage(UPDATED_KEY, remote.updatedAt)
}

export const settingsStorage = { readTheme, writeTheme, CITIES_KEY }
