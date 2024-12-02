import { UrlEncodedBody, QueryParam, RawBody } from '../model/types'

export const tryDeserialize = (raw: RawBody): UrlEncodedBody | RawBody => {
  try {
    const params = [...new URLSearchParams(raw.text).entries()].map(
      ([name, value]) => ({
        name,
        value,
      })
    )

    return {
      type: 'urlencoded',
      params: params,
    }
  } catch {
    return raw
  }
}

export const serialize = (params: QueryParam[]): RawBody => ({
  type: 'raw',
  mimeType: 'application/x-www-form-urlencoded',
  text: new URLSearchParams(
    params.map(({ name, value = '' }) => [name, value])
  ).toString(),
})
