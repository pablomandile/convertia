// Pares de monedas que se prerenderizan (SEO) y se muestran como accesos rápidos.
export const popularCurrencyPairs: Array<[string, string]> = [
  ['USD', 'ARS'],
  ['EUR', 'ARS'],
  ['BRL', 'ARS'],
  ['USD', 'EUR'],
  ['EUR', 'USD'],
  ['USD', 'BRL'],
  ['USD', 'MXN'],
  ['USD', 'CLP'],
  ['USD', 'UYU'],
  ['USD', 'COP'],
  ['GBP', 'USD'],
  ['USD', 'JPY'],
  ['BTC', 'USD'],
  ['ETH', 'USD'],
  ['BTC', 'ARS'],
  ['XAU', 'USD'],
]

/** Monedas que van primero en los selectores. */
export const featuredCurrencies = ['USD', 'ARS', 'EUR', 'BRL', 'GBP', 'MXN', 'CLP', 'UYU', 'COP', 'PEN', 'PYG', 'BOB', 'JPY', 'CNY', 'CHF', 'CAD', 'AUD', 'BTC', 'ETH', 'USDT']

export function currencyPairPath(from: string, to: string): string {
  return `/monedas/${from.toLowerCase()}-a-${to.toLowerCase()}`
}
