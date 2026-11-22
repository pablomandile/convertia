import Decimal from 'decimal.js-light'

export { Decimal }
export type { CategoryDef, UnitDef } from './types'
export { categories } from './categories'
export { convert, convertToAll, fromBase, getCategory, getUnit, round, toBase } from './convert'
export type { Numeric } from './convert'
export { normalize, pairSlug, parsePairSlug, slugify, unitPlural, unitSlug } from './slug'
export { findUnits, parseNumber, parseQuery } from './parse'
export type { ParseResult } from './parse'
export { convertCurrency, currencyAliases, currencyName, resolveCurrency } from './currency'
export type { Rates } from './currency'
export { amountToWords, formatInBase, fromRoman, groupDigits, integerToWords, parseInBase, toRoman } from './tools/numeros'
export {
  addVat, adjustForInflation, averageMonthlyInflation, compareInstallments, fixedTermDeposit, impliedMonthlyRate,
  indexAt, inflationRates, presentValueOfInstallments, realReturnPct, removeVat, VAT_RATES,
} from './tools/dinero'
export type { IndexSeries } from './tools/dinero'
export {
  convertIngredient, formatQuantity, INGREDIENTS, KITCHEN_MEASURES, oven, OVEN_TABLE, ovenLabel, parseQuantity, scaleRecipe,
} from './tools/cocina'
export type { Ingredient, KitchenMeasure } from './tools/cocina'
export {
  addDays, addMonths, age, businessDaysBetween, CITIES, dateDiff, daysInMonth, formatOffset, fromUnix, parseISODate,
  toISODate, wallTime, weekday, zonedToInstant, zoneOffsetMinutes,
} from './tools/fechas'
export type { CalendarDate, City } from './tools/fechas'
export { PAPER_SIZES, paperPixels, ringFromCircumference, ringFromDiameter, ringFromUS, SHOE_SYSTEMS, shoeSizes } from './tools/talles'
export type { PaperSize, ShoeSystem } from './tools/talles'
export {
  aspectRatio, contrastRatio, convertCss, CSS_UNITS, cssToPx, hslToRgb, luminance, parseColor, rgbToCmyk, rgbToHsl,
  screenDensity, toHex, wcag,
} from './tools/diseno'
export type { CssUnit, RGBA } from './tools/diseno'
