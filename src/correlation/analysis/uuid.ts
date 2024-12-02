import { Correlation } from '../correlation'
import { isUUID } from '../utils'

export const uuid = (correlation: Correlation): boolean => {
  const value = correlation.from.value.value

  if (typeof value !== 'string') {
    return false
  }

  return isUUID(value)
}
