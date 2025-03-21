import { flow } from 'lodash-es'

import { canonicalHeaderKey } from '@/rules/utils'
import { ProxyData } from '@/types'
import { getLocationHeader, getUpgradeHeader } from '@/utils/headers'

const HEADERS_TO_EXCLUDE = ['Cookie', 'User-Agent', 'Host', 'Content-Length']

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

  // TODO: https://github.com/grafana/k6-studio/issues/277
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `${value}`
}

function isRedirect(response: ProxyData['response']) {
  if (!response) return false
  return [301, 302].includes(response.statusCode)
}

function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

function getRedirectUrl(
  request: ProxyData['request'],
  response: ProxyData['response']
) {
  if (!response || !isRedirect(response)) return undefined
  const location = getLocationHeader(response.headers)

  if (!location) return undefined
  if (isValidUrl(location)) return location

  return buildLocationUrl(request, location)
}

function buildLocationUrl(request: ProxyData['request'], location: string) {
  const { protocol, host } = new URL(request.url)
  return `${protocol}//${host}${location}`
}

export function mergeRedirects(recording: ProxyData[]) {
  const result = []
  const processed = new Set()

  for (const item of recording) {
    const { response, request, id } = item

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
    let nextUrl = getRedirectUrl(request, response)

    // Find the final response by following the redirect chain
    while (nextUrl) {
      // Find request that corresponds to the next URL in the chain and that haven't been processed yet
      const nextRequest = recording.find(
        (req) => req.request.url === nextUrl && !processed.has(req.id)
      )
      if (nextRequest) {
        processed.add(nextRequest.id)
        finalResponse = nextRequest.response
        nextUrl = getRedirectUrl(request, finalResponse)
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

export const removeWebsocketRequests = (recording: ProxyData[]) => {
  return recording.filter((data) => {
    return getUpgradeHeader(data.request.headers) !== 'websocket'
  })
}

export function cleanupRecording(recording: ProxyData[]) {
  return flow(removeWebsocketRequests, mergeRedirects)(recording)
}

export function shouldIncludeHeaderInScript(key: string) {
  return !HEADERS_TO_EXCLUDE.includes(canonicalHeaderKey(key))
}
