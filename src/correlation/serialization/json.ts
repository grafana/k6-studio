import { JsonBody, RawBody } from '../model/types'
import { JsonValue, tryParse } from '../utils'

export const tryDeserialize = (raw: RawBody): JsonBody | RawBody => {
  const data = tryParse(raw.text)

  if (data === undefined) {
    return raw
  }

  return { type: 'json', data }
}

export const serialize = (data: JsonValue): RawBody => ({
  type: 'raw',
  mimeType: 'application/json',
  text: JSON.stringify(data),
})
