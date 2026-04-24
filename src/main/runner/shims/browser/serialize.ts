import { SerializedValue } from '../../schema'

export function serializeValue(value: unknown): SerializedValue {
  if (value === null) return null
  if (value === undefined) return { type: 'undefined' }

  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
      return value

    case 'bigint':
      return Number(value)

    case 'function':
      return { type: 'function', name: value.name, source: value.toString() }

    case 'object': {
      if (value === null) {
        return null
      }

      if (value instanceof Date) {
        return { type: 'date', timestamp: value.getTime() }
      }

      if (value instanceof RegExp) {
        return { type: 'regex', pattern: value.source, flags: value.flags }
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
