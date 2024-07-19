import { ProxyData } from '@/types'
import { queryStringToJSON, safeAtob, stringify } from '@/utils/format'
import { getContentType } from '@/utils/headers'

export function parseParams(data: ProxyData) {
  const hasParams = data.request.query.length || data.request.content

  if (data.request.method === 'OPTIONS' || !data.response || !hasParams) {
    return
  }

  try {
    if (data.request.query.length) {
      return stringify(data.request.query)
    }

    const contentType = getContentType(data.request?.headers ?? [])

    if (contentType === 'application/x-www-form-urlencoded') {
      return stringify(queryStringToJSON(safeAtob(data.request.content)))
    }

    return stringify(JSON.parse(safeAtob(data.request.content)))
  } catch (e) {
    console.error('Failed to parse query parameters', e)
    return
  }
}
