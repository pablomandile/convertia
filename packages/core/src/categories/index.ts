import type { CategoryDef } from '../types'
import { angulo } from './angulo'
import { area } from './area'
import { combustible } from './combustible'
import { datos } from './datos'
import { densidad } from './densidad'
import { energia } from './energia'
import { frecuencia } from './frecuencia'
import { longitud } from './longitud'
import { masa } from './masa'
import { potencia } from './potencia'
import { presion } from './presion'
import { temperatura } from './temperatura'
import { tiempo } from './tiempo'
import { velocidad } from './velocidad'
import { volumen } from './volumen'

// Para sumar una categoría: crear su archivo de datos y agregarla acá.
// El orden es el que se muestra en la portada.
export const categories: CategoryDef[] = [
  longitud,
  masa,
  temperatura,
  volumen,
  area,
  velocidad,
  tiempo,
  datos,
  combustible,
  energia,
  potencia,
  presion,
  angulo,
  frecuencia,
  densidad,
]
