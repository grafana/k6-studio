import { ProxyData } from '@/types'
import { getContentType } from './headers'

export function isNonStaticAssetResponse(data: ProxyData) {
  const { response } = data

  if (!response) return

  const contentType = getContentType(response?.headers) ?? ''

  return NON_STATIC_ASSET_MIME_TYPES.includes(contentType)
}

const NON_STATIC_ASSET_MIME_TYPES = [
  'application/json',
  'multipart/form-data',
  'application/x-www-form-urlencoded',
  'text/html',
  'text/plain',
  'text/xml',
]
