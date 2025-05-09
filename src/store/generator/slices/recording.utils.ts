import { uniq } from 'lodash-es'

import { ProxyData } from '@/types'

export function extractUniqueHosts(requests: ProxyData[]) {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
}

export function groupHostsByParty(hosts: string[]) {
  return hosts.reduce(
    (acc, host) => {
      const key = isHostThirdParty(host) ? 'thirdParty' : 'firstParty'
      return {
        ...acc,
        [key]: [...acc[key], host],
      }
    },
    { firstParty: [], thirdParty: [] }
  )
}

export function isHostThirdParty(host: string) {
  const hostPatterns = [
    '.google.com',
    '.googleapis.com',
    '.gstatic.com',
    '.googleusercontent.com',
    '.googleadservices.com',
    '.doubleclick.net',
    '.google-analytics.com',
    '.googletagmanager.com',
    '.googlesyndication.com',
    '.googletagservices.com',
    '.recaptcha.net',
  ]
  return hostPatterns.some((pattern) => host.includes(pattern))
}

export function shouldResetAllowList({
  requests,
  allowList,
}: {
  requests: ProxyData[]
  allowList: string[]
}) {
  const hosts = extractUniqueHosts(requests)
  // Reset allowlist if selected recording doesn't have previously selected hosts
  return !allowList.every((host) => hosts.includes(host))
}

function newHostsDetected({
  previousRequests,
  requests,
}: {
  previousRequests: ProxyData[]
  requests: ProxyData[]
}) {
  const previousHosts = extractUniqueHosts(previousRequests)
  const hosts = extractUniqueHosts(requests)
  return previousHosts.length && hosts.length > previousHosts.length
}

export function shouldShowAllowListDialog({
  previousRequests,
  requests,
  allowList,
}: {
  previousRequests: ProxyData[]
  requests: ProxyData[]
  allowList: string[]
}) {
  if (requests.length === 0) return false

  return (
    allowList.length === 0 || newHostsDetected({ previousRequests, requests })
  )
}

/**
 * @TODO keeping it here for now, until im directed to a more suitable place.
 * 💡 In a more advance implementation this will react to globalized filters as well. (api filter paths)
 */
type JsonPaths = { response: string[]; request: string[] }
export function generateJsonPaths(recording: ProxyData[]): JsonPaths {
  const request_paths = new Set<string>()
  const response_paths = new Set<string>()

  if (!recording || recording.length === 0) {
    return {
      request: Array.from(request_paths),
      response: Array.from(response_paths),
    }
  }

  for (const proxy of recording) {
    const { request, response } = proxy
    const isRequestJson = isJson(request?.headers || [])
    const isResponseJson = isJson(response?.headers || [])

    if (isRequestJson && request?.content) {
      for (const path of parseToJsonPaths(request.content)) {
        request_paths.add(path)
      }
    }

    if (isResponseJson && response?.content) {
      for (const path of parseToJsonPaths(response.content)) {
        response_paths.add(path)
      }
    }
  }

  return {
    request: Array.from(request_paths),
    response: Array.from(response_paths),
  }
}

function parseToJsonPaths(content: string): string[] {
  const paths: string[] = []

  try {
    const parsed = JSON.parse(content) as unknown
    const queue: { value: unknown; path: string }[] = [
      { value: parsed, path: '' },
    ]

    while (queue.length > 0) {
      const { value, path } = queue.shift()!

      if (Array.isArray(value)) {
        value.forEach((item: Record<string, unknown>, index) => {
          const arrayPath = `${path}[${index}]`
          paths.push(arrayPath)
          queue.push({ value: item, path: arrayPath })
        })
      } else if (value !== null && typeof value === 'object') {
        Object.entries(value).forEach(([key, val]) => {
          const objectPath = path ? `${path}.${key}` : key
          paths.push(objectPath)
          queue.push({ value: val, path: objectPath })
        })
      }
    }
  } catch {
    return []
  }

  return paths
}

function isJson(headersGroups: ProxyData['request']['headers']): boolean {
  return headersGroups.some((headers) => {
    const [key, value] = headers
    return (
      key.toLowerCase() === 'content-type' &&
      value.toLowerCase().includes('application/json')
    )
  })
}
