import { toast } from 'vue-sonner'

export function useShare() {
  async function copy(text: string, message = 'Copiado') {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(message)
    }
    catch {
      toast.error('No se pudo copiar')
    }
  }

  /** Compartir nativo en el celular; en la compu, copia el link. */
  async function share(title: string, text: string, path: string) {
    const url = new URL(path, window.location.origin).toString()
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      }
      catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return
      }
    }
    await copy(url, 'Link copiado')
  }

  return { copy, share }
}
