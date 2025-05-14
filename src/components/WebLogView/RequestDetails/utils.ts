import { jsonrepair } from 'jsonrepair'

import { Request } from '@/types'
import { safeAtob, stringify } from '@/utils/format'
import { getContentType } from '@/utils/headers'

export function parseParams(request: Request) {
  const hasParams = request.query.length || request.content

  if (request.method === 'OPTIONS' || !hasParams) {
    return
  }

  try {
    if (request.content === '') {
      return
    }

    const contentType = getContentType(request?.headers ?? [])
    const contentDecoded = safeAtob(request.content ?? '')

    if (contentType === 'multipart/form-data') {
      return contentDecoded
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      if (isJsonString(contentDecoded)) {
        return stringify(JSON.parse(contentDecoded))
      }

      // k6 returns form data as key=value pair string
      return stringify(JSON.parse(queryStringToJSONString(contentDecoded)))
    }

    return stringify(
      // TODO: https://github.com/grafana/k6-studio/issues/277
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      JSON.parse(
        jsonrepair(
          parsePythonByteString(wrapTemplateExpressionsInQuotes(contentDecoded))
        )
      )
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

// When replacing number values in the payload, we need to wrap variable expressions
// in quotes, otherwise JSON parse will fail
function wrapTemplateExpressionsInQuotes(str: string) {
  return str.replace(
    /(:\s*)(\$\{[^}]+\})(?=[,}])/g,
    (_, prefix, expr) => `${prefix}"${expr}"`
  )
}
