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
}

export const tools: ToolDef[] = [
  { path: '/dolar', name: 'Dólar hoy en Argentina', description: 'Oficial, blue, MEP, CCL, tarjeta y cripto, con conversor.', emoji: '💵', group: 'dinero' },
  { path: '/inflacion', name: 'Calculadora de inflación', description: '¿Cuánto valen hoy $10.000 de 2019? Con el IPC del INDEC.', emoji: '📈', group: 'dinero' },
  { path: '/cuotas', name: 'Cuotas o contado', description: 'Qué conviene, teniendo en cuenta la inflación.', emoji: '💳', group: 'dinero' },
  { path: '/plazo-fijo', name: 'Plazo fijo', description: 'Interés, TEA y si le gana a la inflación.', emoji: '🏦', group: 'dinero' },
  { path: '/iva', name: 'Calculadora de IVA', description: 'Sumar o quitar IVA: 21 %, 10,5 %, 27 % y más.', emoji: '🧾', group: 'dinero' },
  { path: '/cocina', name: 'Tazas y cucharadas a gramos', description: 'Harina, azúcar, manteca y más: de volumen a peso y al revés.', emoji: '🥣', group: 'cocina' },
  { path: '/cocina/horno', name: 'Temperaturas del horno', description: '°C, °F, marca de gas y horno con ventilador.', emoji: '🔥', group: 'cocina' },
  { path: '/cocina/escalar-receta', name: 'Escalar una receta', description: 'Pegá la receta y pasala a más o menos porciones.', emoji: '📝', group: 'cocina' },
  { path: '/husos-horarios', name: 'Husos horarios', description: 'Qué hora es en otra ciudad y cuándo conviene una reunión.', emoji: '🌍', group: 'tiempo' },
  { path: '/fechas/diferencia', name: 'Días entre fechas', description: 'Años, meses, días y días hábiles entre dos fechas.', emoji: '📅', group: 'tiempo' },
  { path: '/fechas/edad', name: 'Calculadora de edad', description: 'Edad exacta, días vividos y cuánto falta para el cumpleaños.', emoji: '🎂', group: 'tiempo' },
  { path: '/fechas/timestamp', name: 'Timestamp Unix', description: 'De timestamp a fecha y de fecha a timestamp.', emoji: '⏲️', group: 'tiempo' },
  { path: '/numeros/romanos', name: 'Números romanos', description: 'De números a romanos y de romanos a números.', emoji: '🏛️', group: 'numeros' },
  { path: '/numeros/bases', name: 'Binario, hexadecimal y bases', description: 'Decimal, binario, octal, hexadecimal y cualquier base de 2 a 36.', emoji: '🔢', group: 'numeros' },
  { path: '/numeros/a-letras', name: 'Número a letras', description: 'Montos en letras para cheques, recibos y facturas.', emoji: '✍️', group: 'numeros' },
]

export function toolsByGroup() {
  return (Object.keys(toolGroups) as ToolGroup[])
    .map(group => ({ group, label: toolGroups[group], items: tools.filter(t => t.group === group) }))
    .filter(g => g.items.length)
}
