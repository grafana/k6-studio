import { Correlation } from '../correlation'

export const hex = (correlation: Correlation): boolean => {
  const value = correlation.from.value.value

  if (typeof value !== 'string') {
    return false
  }

  return /^[0-9a-f]{2}(-?[0-9a-f]{2})+$/i.test(value)
}
