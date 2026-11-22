import { normalize } from '@convertia/core'

// Herramientas que no son "unidad A → unidad B". Se listan en la portada, el footer y el sitemap,
// y se prerenderizan (nuxt.config.ts). Al sumar una página nueva, agregarla acá.

export type ToolGroup = 'dinero' | 'numeros' | 'cocina' | 'talles' | 'tiempo' | 'diseno'

export const toolGroups: Record<ToolGroup, string> = {
  dinero: 'Dinero',
  numeros: 'Números',
  cocina: 'Cocina',
  talles: 'Talles y medidas',
  tiempo: 'Fechas y horas',
  diseno: 'Diseño y pantalla',
}

export interface ToolDef {
  path: string
  name: string
  description: string
  emoji: string
  group: ToolGroup
  /** Palabras extra para la búsqueda de la barra inteligente. */
  keywords?: string[]
}

export const tools: ToolDef[] = [
  { path: '/dolar', name: 'Dólar hoy en Argentina', description: 'Oficial, blue, MEP, CCL, tarjeta y cripto, con conversor.', emoji: '💵', group: 'dinero', keywords: ['blue', 'mep', 'ccl', 'contado con liqui', 'cotizacion', 'tarjeta', 'brecha'] },
  { path: '/inflacion', name: 'Calculadora de inflación', description: '¿Cuánto valen hoy $10.000 de 2019? Con el IPC del INDEC.', emoji: '📈', group: 'dinero', keywords: ['ipc', 'indec', 'actualizar', 'ajustar', 'precios'] },
  { path: '/cuotas', name: 'Cuotas o contado', description: 'Qué conviene, teniendo en cuenta la inflación.', emoji: '💳', group: 'dinero', keywords: ['tarjeta', 'financiar', 'sin interes', 'descuento', 'tasa'] },
  { path: '/plazo-fijo', name: 'Plazo fijo', description: 'Interés, TEA y si le gana a la inflación.', emoji: '🏦', group: 'dinero', keywords: ['tna', 'tea', 'interes', 'banco', 'ahorro'] },
  { path: '/iva', name: 'Calculadora de IVA', description: 'Sumar o quitar IVA: 21 %, 10,5 %, 27 % y más.', emoji: '🧾', group: 'dinero', keywords: ['impuesto', 'factura', 'neto', 'alicuota'] },
  { path: '/cocina', name: 'Tazas y cucharadas a gramos', description: 'Harina, azúcar, manteca y más: de volumen a peso y al revés.', emoji: '🥣', group: 'cocina', keywords: ['receta', 'harina', 'azucar', 'manteca', 'gramos', 'cucharada', 'taza'] },
  { path: '/cocina/horno', name: 'Temperaturas del horno', description: '°C, °F, marca de gas y horno con ventilador.', emoji: '🔥', group: 'cocina', keywords: ['grados', 'temperatura', 'gas', 'fahrenheit'] },
  { path: '/cocina/escalar-receta', name: 'Escalar una receta', description: 'Pegá la receta y pasala a más o menos porciones.', emoji: '📝', group: 'cocina', keywords: ['porciones', 'duplicar', 'mitad', 'receta'] },
  { path: '/talles/calzado', name: 'Talles de calzado', description: 'Argentina, Europa, EE. UU. y Reino Unido, desde el largo del pie.', emoji: '👟', group: 'talles', keywords: ['zapatillas', 'zapatos', 'pie', 'talle', 'numero'] },
  { path: '/talles/anillos', name: 'Talles de anillos', description: 'Diámetro, circunferencia y talle de EE. UU.', emoji: '💍', group: 'talles', keywords: ['anillo', 'alianza', 'dedo', 'joyeria'] },
  { path: '/papel', name: 'Tamaños de papel', description: 'A4, oficio, carta y más: en mm, pulgadas y píxeles para imprimir.', emoji: '📄', group: 'talles', keywords: ['a4', 'oficio', 'carta', 'hoja', 'imprimir'] },
  { path: '/colores', name: 'Conversor de colores', description: 'HEX, RGB, HSL y CMYK, con contraste para accesibilidad.', emoji: '🎨', group: 'diseno', keywords: ['hex', 'rgb', 'hsl', 'cmyk', 'contraste', 'wcag'] },
  { path: '/diseno/px-a-rem', name: 'px a rem', description: 'px, rem, em, pt y más unidades CSS.', emoji: '📐', group: 'diseno', keywords: ['css', 'pixeles', 'em', 'pt', 'fuente'] },
  { path: '/diseno/ppi', name: 'PPI de pantallas', description: 'Densidad, tamaño físico y proporción de una pantalla.', emoji: '🖥️', group: 'diseno', keywords: ['dpi', 'pantalla', 'monitor', 'resolucion', 'pulgadas'] },
  { path: '/husos-horarios', name: 'Husos horarios', description: 'Qué hora es en otra ciudad y cuándo conviene una reunión.', emoji: '🌍', group: 'tiempo', keywords: ['hora', 'zona horaria', 'reunion', 'gmt', 'utc'] },
  { path: '/fechas/diferencia', name: 'Días entre fechas', description: 'Años, meses, días y días hábiles entre dos fechas.', emoji: '📅', group: 'tiempo', keywords: ['dias', 'calendario', 'habiles', 'plazo'] },
  { path: '/fechas/edad', name: 'Calculadora de edad', description: 'Edad exacta, días vividos y cuánto falta para el cumpleaños.', emoji: '🎂', group: 'tiempo', keywords: ['cumpleanos', 'años', 'nacimiento'] },
  { path: '/fechas/timestamp', name: 'Timestamp Unix', description: 'De timestamp a fecha y de fecha a timestamp.', emoji: '⏲️', group: 'tiempo', keywords: ['unix', 'epoch', 'milisegundos'] },
  { path: '/numeros/romanos', name: 'Números romanos', description: 'De números a romanos y de romanos a números.', emoji: '🏛️', group: 'numeros', keywords: ['romano', 'siglo'] },
  { path: '/numeros/bases', name: 'Binario, hexadecimal y bases', description: 'Decimal, binario, octal, hexadecimal y cualquier base de 2 a 36.', emoji: '🔢', group: 'numeros', keywords: ['binario', 'hexadecimal', 'octal', 'hex', 'bits'] },
  { path: '/numeros/a-letras', name: 'Número a letras', description: 'Montos en letras para cheques, recibos y facturas.', emoji: '✍️', group: 'numeros', keywords: ['cheque', 'letras', 'recibo', 'monto', 'escribir'] },
]

/** Herramientas que coinciden con lo que se escribió en la barra (todas las palabras tienen que aparecer). */
export function searchTools(query: string, limit = 3): ToolDef[] {
  const words = normalize(query).split(/\s+/).filter(w => w.length >= 2)
  if (!words.length) return []
  return tools
    .map((t) => {
      const name = normalize(t.name)
      const haystack = normalize([t.name, t.description, t.path, ...(t.keywords ?? [])].join(' '))
      if (!words.every(w => haystack.includes(w))) return { t, score: 0 }
      return { t, score: words.reduce((s, w) => s + (name.includes(w) ? 3 : 1), 0) }
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(x => x.t)
}

export function toolsByGroup() {
  return (Object.keys(toolGroups) as ToolGroup[])
    .map(group => ({ group, label: toolGroups[group], items: tools.filter(t => t.group === group) }))
    .filter(g => g.items.length)
}
