import { ProxyData } from '@/types'
import { safeAtob, stringify } from '@/utils/format'
import { getContentType } from '@/utils/headers'

export function parseParams(data: ProxyData) {
  const hasParams = data.request.query.length || data.request.content

  if (data.request.method === 'OPTIONS' || !data.response || !hasParams) {
    return
  }

  try {
    const contentType = getContentType(data.request?.headers ?? [])

    if (contentType === 'application/x-www-form-urlencoded') {
      return safeAtob(data.request.content ?? '')
    }

    return stringify(
      JSON.parse(parsePythonByteString(safeAtob(data.request.content ?? '')))
    )
  } catch (e) {
    console.error('Failed to parse query parameters', e)
    return
  }
}

// Python byte strings are prefixed with b' and suffixed with '
function parsePythonByteString(byteString: string) {
  return byteString.replace(/b'(.*)'/, '$1')
}
