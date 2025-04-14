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
  const hostPatterns = ['.google.com', '.googleapis.com', '.gstatic.com']
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
