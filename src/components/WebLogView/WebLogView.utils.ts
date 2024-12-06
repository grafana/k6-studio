import { GroupedProxyData, ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'
import { isNonStaticAssetResponse } from '@/utils/staticAssets'

export function removeQueryStringFromUrl(url: string) {
  return url.split('?')[0]
}

export function removeProtocolFromUrl(url: string) {
  return url.split('://')[1]
}

export function removeHostFromUrl(url?: string) {
  if (!url) return ''

  const [, ...path] = url.split('/')
  return path.join('/')
}

export function isGroupedProxyData(
  data: ProxyData[] | GroupedProxyData
): data is GroupedProxyData {
  return !Array.isArray(data)
}

export function getRequestType(data: ProxyData) {
  if (isNonStaticAssetResponse(data)) {
    return 'fetch'
  }

  const mimeType = getContentType(data.response?.headers ?? [])
  return mimeType ? mimeType.split('/')[1] : 'unknown'
}
