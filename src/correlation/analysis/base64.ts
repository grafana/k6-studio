import { Correlation } from '../correlation'

import { isBase64 } from './utils'

// Since we can get false positives (i.e. the string "test" is a valid base64 string)
// we need to check that the string is likely to not be a word of some kind. 13 character
// words are pretty darn weird (https://wordunscrambler.org/13-letter-words).
const BASE64_LENGTH_HEURISTIC = 13

export const isPadded = (base64: string) => /=$/i.test(base64)

export const base64 = (correlation: Correlation): boolean => {
  const value = correlation.from.value.value

  if (typeof value !== 'string') {
    return false
  }

  if (!isBase64(value)) {
    return false
  }

  // If the string is well-formed, but has no padding it might be any
  // text. Fallback to using a heuristic to rule out common words.
  if (!isPadded(value)) {
    return value.length > BASE64_LENGTH_HEURISTIC
  }

  // This is maybe almost definitely a likely base64 string, perhaps.
  return true
}
