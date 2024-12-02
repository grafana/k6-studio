import { tryDecodeBase64 } from './utils'
import { Correlation } from '../correlation'
import { JsonObject, tryParse } from '../utils'

const pad = (str: string) => {
  switch (str.length % 4) {
    case 0:
      return str

    case 2:
      return str + '=='

    case 3:
      return str + '='

    default:
      return undefined
  }
}

type Header = JsonObject
type Payload = JsonObject

const tryParseHeader = (str: string): Header | undefined => {
  const result = tryParse(str)

  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    return undefined
  }

  return result
}

const tryParsePayload = (str: string): Payload | undefined => {
  const result = tryParse(str)

  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    return undefined
  }

  return result
}

const toStandardBase64 = (str: string) =>
  pad(str.replace(/-|_/i, (token) => (token === '-' ? '+' : '/')))

export const decode = (token: string) => {
  const parts = token.split('.')

  if (parts.length !== 3) {
    return undefined
  }

  const [header, payload] = parts
    .slice(0, 2)
    .map(toStandardBase64)
    .map(tryDecodeBase64)

  if (header === undefined || payload === undefined) {
    return undefined
  }

  const result = {
    header: tryParseHeader(header),
    payload: tryParsePayload(payload),
    signature: parts[2],
  }

  return result.header && result.payload && result
}

export const jwt = (correlation: Correlation): boolean => {
  const value = correlation.from.value.value

  if (typeof value !== 'string') {
    return false
  }

  return decode(value) !== undefined
}
