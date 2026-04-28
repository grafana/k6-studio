import { ActionLocator, SerializedValue } from '../../schema'

import { locatorDetail, pageDetail } from './proxies/symbols'

export function serializeValue(value: unknown): SerializedValue {
  if (value === null) {
    return null
  }

  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      return value

    case 'bigint':
      return Number(value)

    case 'symbol':
      return { type: 'symbol', value: value.toString() }

    case 'function':
      return { type: 'function', name: value.name, source: value.toString() }

    case 'undefined':
      return { type: 'undefined' }

    case 'object': {
      if (value instanceof Date) {
        return { type: 'date', timestamp: value.getTime() }
      }

      if (value instanceof RegExp) {
        return { type: 'regex', pattern: value.source, flags: value.flags }
      }

      if (locatorDetail in value) {
        return {
          type: 'locator',
          locator: value[locatorDetail] as ActionLocator,
        }
      }

      if (pageDetail in value) {
        return { type: 'page' }
      }

      if (Array.isArray(value)) {
        return value.map(serializeValue)
      }

      return {
        type: 'object',
        value: Object.fromEntries(
          Object.entries(value).map(([k, v]) => [k, serializeValue(v)])
        ),
      }
    }

    default:
      return { type: 'undefined' }
  }
}
