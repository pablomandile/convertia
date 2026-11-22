// El script en <head> (nuxt.config) aplica la clase .dark antes de pintar; esto solo la cambia.
export function useTheme() {
  const isDark = useState('theme:dark', () => false)

  onMounted(() => {
    isDark.value = document.documentElement.classList.contains('dark')
  })

  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    // Texto plano, no JSON: el script del <head> compara contra 'dark'.
    settingsStorage.writeTheme(isDark.value ? 'dark' : 'light')
    touchSettings()
  }

  return { isDark, toggle }
}
