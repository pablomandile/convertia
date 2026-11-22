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
