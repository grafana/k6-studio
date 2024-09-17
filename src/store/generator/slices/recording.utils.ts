import { ProxyData } from '@/types'
import { uniq } from 'lodash-es'

export function extractUniqueHosts(requests: ProxyData[]) {
  return uniq(requests.map((request) => request.request.host).filter(Boolean))
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
