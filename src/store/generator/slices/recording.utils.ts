import { uniq } from 'lodash-es'

import { ProxyData } from '@/types'
import type { HarHeader } from '@/types/recording'

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
 *  @TODO should move to a more generic json oriented folder or util
 * 💡 In a more advance implementation this will react to globalized filters as well. (api filter paths)
 */
export function generateJsonPaths(data: string): string[] {
  const jsonPathsSet = new Set<string>()

  if (!data) {
    return []
  }

  const parsedContent = parseToJsonPaths(data)
  parsedContent.forEach((path) => jsonPathsSet.add(path))

  return Array.from(jsonPathsSet)
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

/**
 * Takes a set of headers and determines if its of json content type
 */
export function isJsonContentType(headerValues: HarHeader[]): boolean {
  return headerValues.some((header) => {
    const name = header.name
    const value = header.value
    if (!name || !value) {
      return false
    }
    return (
      name.toLowerCase() === 'content-type' &&
      value.toLowerCase().includes('application/json')
    )
  })
}

export function extractUniqueJsonPaths(requests: ProxyData[]): {
  requestJsonPaths: string[]
  responseJsonPaths: string[]
} {
  const requestJsonPaths = new Set<string>()
  const responseJsonPaths = new Set<string>()

  for (const proxy of requests) {
    proxy.request?.jsonPaths?.forEach((path) => requestJsonPaths.add(path))
    proxy.response?.jsonPaths?.forEach((path) => responseJsonPaths.add(path))
  }

  return {
    requestJsonPaths: Array.from(requestJsonPaths),
    responseJsonPaths: Array.from(responseJsonPaths),
  }
}
