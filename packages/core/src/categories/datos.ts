import type { CategoryDef } from '../types'

// Base: byte. Prefijos decimales (KB = 1000 B) y binarios (KiB = 1024 B) por separado.
export const datos: CategoryDef = {
  id: 'data',
  slug: 'datos',
  name: { es: 'Datos digitales', en: 'Digital storage' },
  baseUnit: 'B',
  popular: [['GB', 'MB'], ['MB', 'KB'], ['GiB', 'GB'], ['TB', 'GB'], ['Mbit', 'MB']],
  units: [
    { id: 'bit', symbol: 'bit', name: { es: 'Bit', en: 'Bit' }, factor: '0.125', system: 'otro', aliases: ['bit', 'bits'] },
    { id: 'B', symbol: 'B', name: { es: 'Byte', en: 'Byte' }, factor: '1', system: 'otro', aliases: ['byte', 'bytes'] },
    { id: 'kbit', symbol: 'kbit', name: { es: 'Kilobit', en: 'Kilobit' }, factor: '125', system: 'si', aliases: ['kilobit', 'kilobits', 'kbps'] },
    { id: 'Mbit', symbol: 'Mbit', name: { es: 'Megabit', en: 'Megabit' }, factor: '125000', system: 'si', aliases: ['megabit', 'megabits', 'mbps'] },
    { id: 'Gbit', symbol: 'Gbit', name: { es: 'Gigabit', en: 'Gigabit' }, factor: '125000000', system: 'si', aliases: ['gigabit', 'gigabits', 'gbps'] },
    { id: 'KB', symbol: 'KB', name: { es: 'Kilobyte', en: 'Kilobyte' }, factor: '1000', system: 'si', aliases: ['kilobyte', 'kilobytes'] },
    { id: 'MB', symbol: 'MB', name: { es: 'Megabyte', en: 'Megabyte' }, factor: '1000000', system: 'si', aliases: ['megabyte', 'megabytes', 'megas'] },
    { id: 'GB', symbol: 'GB', name: { es: 'Gigabyte', en: 'Gigabyte' }, factor: '1000000000', system: 'si', aliases: ['gigabyte', 'gigabytes', 'gigas'] },
    { id: 'TB', symbol: 'TB', name: { es: 'Terabyte', en: 'Terabyte' }, factor: '1000000000000', system: 'si', aliases: ['terabyte', 'terabytes', 'teras'] },
    { id: 'PB', symbol: 'PB', name: { es: 'Petabyte', en: 'Petabyte' }, factor: '1000000000000000', system: 'si', aliases: ['petabyte', 'petabytes'] },
    { id: 'KiB', symbol: 'KiB', name: { es: 'Kibibyte', en: 'Kibibyte' }, factor: '1024', system: 'otro', aliases: ['kibibyte', 'kibibytes'] },
    { id: 'MiB', symbol: 'MiB', name: { es: 'Mebibyte', en: 'Mebibyte' }, factor: '1048576', system: 'otro', aliases: ['mebibyte', 'mebibytes'] },
    { id: 'GiB', symbol: 'GiB', name: { es: 'Gibibyte', en: 'Gibibyte' }, factor: '1073741824', system: 'otro', aliases: ['gibibyte', 'gibibytes'] },
    { id: 'TiB', symbol: 'TiB', name: { es: 'Tebibyte', en: 'Tebibyte' }, factor: '1099511627776', system: 'otro', aliases: ['tebibyte', 'tebibytes'] },
  ],
}
