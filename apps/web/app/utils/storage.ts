// localStorage puede no existir o tirar error (modo privado, sitio bloqueado): nunca romper la app.

export function readStorage<T>(key: string, fallback: T): T {
  if (import.meta.server) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : (JSON.parse(raw) as T)
  }
  catch {
    return fallback
  }
}

export function writeStorage(key: string, value: unknown): void {
  if (import.meta.server) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  }
  catch {
    // Sin espacio o bloqueado: se pierde la preferencia, no la conversión.
  }
}
