import { GroupedProxyData, ProxyData } from '@/types'

export function removeQueryStringFromUrl(url: string) {
  return url.split('?')[0]
}

export function removeProtocolFromUrl(url: string) {
  return url.split('://')[1]
}

export function isGroupedProxyData(
  data: ProxyData[] | GroupedProxyData
): data is GroupedProxyData {
  return !Array.isArray(data)
}
