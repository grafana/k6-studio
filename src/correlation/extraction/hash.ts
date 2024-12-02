import { JsonPrimitive } from '../utils'

export const quickHash = (value: JsonPrimitive) =>
  value === null ? 'null' : `${typeof value}${value}`
