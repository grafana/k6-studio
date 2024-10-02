import { ProxyData } from '@/types'
import { getLocationHeader } from '@/utils/headers'

// TODO: find a well-maintained library for this
export function stringify(value: unknown): string {
  if (typeof value === 'string') {
    return `'${value}'`
  }

  if (Array.isArray(value)) {
    return `[${value.map(stringify).join(', ')}]`
  }

  if (typeof value === 'object' && value !== null) {
    const properties = Object.entries(value)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${stringify(value)}`)
      .join(',\n')

    return `{${properties}}`
  }

  return `${value}`
}

function isRedirect(response: ProxyData['response']) {
  if (!response) return false
  return response.statusCode >= 300 && response.statusCode < 400
}

function findNextUrl(response: ProxyData['response']) {
  if (!response || !isRedirect(response)) return undefined
  return getLocationHeader(response.headers)
}

export function mergeRedirects(recording: ProxyData[]) {
  const result = []
  const processed = new Set()

  for (const item of recording) {
    const { response, id } = item

    // Skip requests that have been processed
    if (processed.has(id)) {
      continue
    }

    // Requests without response don't need to be merged
    if (!response) {
      result.push(item)
      processed.add(id)
      continue
    }

    // Requests that are not redirects don't need to be merged
    if (!isRedirect(response)) {
      result.push(item)
      processed.add(id)
      continue
    }

    let finalResponse: ProxyData['response'] = response
    let nextUrl = findNextUrl(response)

    // Find the final response by following the redirect chain
    while (nextUrl) {
      const nextRequest = recording.find((req) => req.request.url === nextUrl)
      if (nextRequest) {
        processed.add(nextRequest.id)
        finalResponse = nextRequest.response
        nextUrl = findNextUrl(finalResponse)
      } else {
        break
      }
    }

    result.push({
      ...item,
      response: finalResponse,
    })

    processed.add(id)
  }

  return result
}
