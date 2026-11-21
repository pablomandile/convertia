/**
 * Una unidad se define como datos. La conversión siempre pasa por la
 * unidad base de su categoría: valor → base → destino.
 *
 * - Lineal: `factor` = cuántas unidades base hay en 1 de esta unidad
 *   (string para no perder precisión: "0.3048"; admite fracciones: "5/9").
 * - Afín (temperatura): `offset` además del factor → base = valor·factor + offset.
 * - Inversa (consumo de combustible): `inverse: true` → base = factor / valor.
 */
export interface UnitDef {
  id: string
  symbol: string
  name: { es: string, en: string }
  /** Plural en español, si no es el nombre + "s". */
  plural?: string
  /** Formas alternativas que reconoce el parser ("pies", "ft", "'"). */
  aliases?: string[]
  factor: string
  offset?: string
  inverse?: boolean
  /** Sistema de medida, para agrupar en la UI. */
  system?: 'si' | 'métrico' | 'imperial' | 'us' | 'otro'
}

export interface CategoryDef {
  id: string
  /** Slug en español para la URL: /longitud */
  slug: string
  name: { es: string, en: string }
  baseUnit: string
  /** Pares populares, para prerender y accesos rápidos: [desde, hasta]. */
  popular?: Array<[string, string]>
  units: UnitDef[]
}
