import { jsonrepair } from 'jsonrepair'

import { ProxyData } from '@/types'
import { safeAtob, stringify } from '@/utils/format'
import { getContentType } from '@/utils/headers'

export function parseParams(data: ProxyData) {
  const hasParams = data.request.query.length || data.request.content

  if (data.request.method === 'OPTIONS' || !hasParams) {
    return
  }

  try {
    if (data.request.content === '') {
      return
    }

    const contentType = getContentType(data.request?.headers ?? [])
    const contentDecoded = safeAtob(data.request.content ?? '')

    if (contentType === 'multipart/form-data') {
      return contentDecoded
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      if (isJsonString(contentDecoded)) {
        return contentDecoded
      }

      // k6 returns form data as key=value pair string
      return queryStringToJSONString(contentDecoded)
    }

    return stringify(
      // TODO: https://github.com/grafana/k6-studio/issues/277
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      JSON.parse(jsonrepair(parsePythonByteString(contentDecoded)))
    )
  } catch (e) {
    console.error('Failed to parse query parameters', e)
    return
  }
}

// Python byte strings are prefixed with b' and suffixed with '
function parsePythonByteString(byteString: string) {
  return byteString.replace(/^b'(.*)'$/, '$1')
}

function queryStringToJSONString(str: string) {
  return JSON.stringify(Object.fromEntries(new URLSearchParams(str)))
}

export function isJsonString(str: string) {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function getRawContent(content: string) {
  return content.replace(/\s+/g, '')
}
