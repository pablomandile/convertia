// Talles y medidas: calzado, anillos y tamaños de papel.

// --- Calzado -----------------------------------------------------------------------------
// Todo pasa por el largo del pie en cm. Fórmulas de uso habitual (aproximadas: cada marca horma distinto):
//   EE. UU. hombre = 3 × largo(pulgadas) − 22   (escala Brannock)
//   EE. UU. mujer  = EE. UU. hombre + 1,5
//   R. U.          = EE. UU. hombre − 1
//   Europa         = 1,5 × (largo cm + 1,5)       (punto de París = ⅔ cm sobre el largo de la horma)
//   Argentina      ≈ Europa − 1                   (AR 40 = EU 41)

export type ShoeSystem = 'cm' | 'eu' | 'ar' | 'usm' | 'usw' | 'uk'

export const SHOE_SYSTEMS: Array<{ id: ShoeSystem, name: string }> = [
  { id: 'cm', name: 'Largo del pie (cm)' },
  { id: 'ar', name: 'Argentina' },
  { id: 'eu', name: 'Europa' },
  { id: 'usm', name: 'EE. UU. hombre' },
  { id: 'usw', name: 'EE. UU. mujer' },
  { id: 'uk', name: 'Reino Unido' },
]

function footFrom(system: ShoeSystem, size: number): number {
  switch (system) {
    case 'cm': return size
    case 'eu': return size / 1.5 - 1.5
    case 'ar': return (size + 1) / 1.5 - 1.5
    case 'usm': return (size + 22) / 3 * 2.54
    case 'usw': return (size - 1.5 + 22) / 3 * 2.54
    case 'uk': return (size + 1 + 22) / 3 * 2.54
  }
}

const half = (n: number) => Math.round(n * 2) / 2

/** Todas las equivalencias a partir de un talle (EE. UU. y R. U. a medio número; Europa y Argentina enteros). */
export function shoeSizes(system: ShoeSystem, size: number): Record<ShoeSystem, number> {
  const cm = footFrom(system, size)
  const inches = cm / 2.54
  const usm = 3 * inches - 22
  const eu = 1.5 * (cm + 1.5)
  return {
    cm: Math.round(cm * 10) / 10,
    // Europa y Argentina se venden casi siempre en números enteros.
    eu: Math.round(eu),
    ar: Math.round(eu - 1),
    usm: half(usm),
    usw: half(usm + 1.5),
    uk: half(usm - 1),
  }
}

// --- Anillos -----------------------------------------------------------------------------
// Talle EE. UU. ↔ diámetro interno: d(mm) = 11,63 + 0,8128 × talle. ISO 8653 = circunferencia interna en mm.

export function ringFromDiameter(diameterMm: number) {
  return {
    diameter: Math.round(diameterMm * 10) / 10,
    circumference: Math.round(Math.PI * diameterMm * 10) / 10,
    us: Math.round((diameterMm - 11.63) / 0.8128 * 4) / 4,
  }
}

export const ringFromUS = (us: number) => ringFromDiameter(11.63 + 0.8128 * us)
export const ringFromCircumference = (mm: number) => ringFromDiameter(mm / Math.PI)

// --- Papel ----------------------------------------------------------------------------------

export interface PaperSize { id: string, name: string, w: number, h: number, group: string }

export const PAPER_SIZES: PaperSize[] = [
  ...(['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'] as const).map((id, i) => {
    const sizes: Array<[number, number]> = [[841, 1189], [594, 841], [420, 594], [297, 420], [210, 297], [148, 210], [105, 148], [74, 105], [52, 74]]
    return { id, name: id, w: sizes[i]![0], h: sizes[i]![1], group: 'ISO A' }
  }),
  ...(['B0', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6'] as const).map((id, i) => {
    const sizes: Array<[number, number]> = [[1000, 1414], [707, 1000], [500, 707], [353, 500], [250, 353], [176, 250], [125, 176]]
    return { id, name: id, w: sizes[i]![0], h: sizes[i]![1], group: 'ISO B' }
  }),
  { id: 'oficio', name: 'Oficio (Argentina)', w: 216, h: 340, group: 'América' },
  { id: 'carta', name: 'Carta (Letter)', w: 215.9, h: 279.4, group: 'América' },
  { id: 'legal', name: 'Legal (EE. UU.)', w: 215.9, h: 355.6, group: 'América' },
  { id: 'tabloide', name: 'Tabloide', w: 279.4, h: 431.8, group: 'América' },
  { id: 'c4', name: 'Sobre C4', w: 229, h: 324, group: 'Sobres' },
  { id: 'c5', name: 'Sobre C5', w: 162, h: 229, group: 'Sobres' },
  { id: 'c6', name: 'Sobre C6', w: 114, h: 162, group: 'Sobres' },
  { id: 'dl', name: 'Sobre DL', w: 110, h: 220, group: 'Sobres' },
]

/** Píxeles para imprimir a una resolución dada (300 ppp para imprenta, 150 para borradores). */
export function paperPixels(paper: PaperSize, dpi: number) {
  return { w: Math.round(paper.w / 25.4 * dpi), h: Math.round(paper.h / 25.4 * dpi) }
}
