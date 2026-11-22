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
  { path: '/numeros/romanos', name: 'Números romanos', description: 'De números a romanos y de romanos a números.', emoji: '🏛️', group: 'numeros' },
  { path: '/numeros/bases', name: 'Binario, hexadecimal y bases', description: 'Decimal, binario, octal, hexadecimal y cualquier base de 2 a 36.', emoji: '🔢', group: 'numeros' },
  { path: '/numeros/a-letras', name: 'Número a letras', description: 'Montos en letras para cheques, recibos y facturas.', emoji: '✍️', group: 'numeros' },
]

export function toolsByGroup() {
  return (Object.keys(toolGroups) as ToolGroup[])
    .map(group => ({ group, label: toolGroups[group], items: tools.filter(t => t.group === group) }))
    .filter(g => g.items.length)
}
