import type { CategoryDef } from '../types'
import { longitud } from './longitud'
import { temperatura } from './temperatura'

// Para sumar una categoría: crear su archivo de datos y agregarla acá.
export const categories: CategoryDef[] = [
  longitud,
  temperatura,
]
