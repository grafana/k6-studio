import { uniq } from 'lodash-es'

import { useFeaturesStore } from '@/store/features'
import { Header, ProxyData } from '@/types'

function extractUniqueHosts(requests: ProxyData[]) {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
}

function groupHostsByParty(hosts: string[]): {
  firstParty: string[]
  thirdParty: string[]
} {
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

export function getHostsByParty(requests: ProxyData[]) {
  const uniqueHosts = extractUniqueHosts(requests)

  return groupHostsByParty(uniqueHosts)
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

function isJsonContent(headers: Header[]): boolean {
  return headers.some(
    ([name, value]) =>
      name?.toLowerCase() === 'content-type' &&
      value?.toLowerCase().includes('application/json')
  )
}

export function extractUniqueJsonPaths(requests: ProxyData[]): {
  requestJsonPaths: string[]
  responseJsonPaths: string[]
} {
  const requestJsonPaths = new Set<string>()
  const responseJsonPaths = new Set<string>()

  if (!useFeaturesStore.getState().features['typeahead-json']) {
    return {
      requestJsonPaths: [],
      responseJsonPaths: [],
    }
  }

  for (const { request, response } of requests) {
    if (request.content && isJsonContent(request.headers)) {
      generateJsonPaths(request.content).forEach((path) =>
        requestJsonPaths.add(path)
      )
    }
    if (response?.content && isJsonContent(response.headers)) {
      generateJsonPaths(response.content).forEach((path) =>
        responseJsonPaths.add(path)
      )
    }
  }

  return {
    requestJsonPaths: Array.from(requestJsonPaths),
    responseJsonPaths: Array.from(responseJsonPaths),
  }
}
