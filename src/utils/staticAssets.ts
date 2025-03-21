import { ProxyData } from '@/types'

import { getContentType } from './headers'

export function isNonStaticAssetResponse(data: ProxyData) {
  const contentType = getContentType(data?.response?.headers ?? [])
  const pathWithoutQuery = data.request.path.split('?')[0] ?? '/'

  if (!contentType) {
    return !isURLStaticAsset(pathWithoutQuery)
  }

  return (
    NON_STATIC_ASSET_MIME_TYPES.includes(contentType) &&
    !isURLStaticAsset(pathWithoutQuery)
  )
}

function getExtFromURL(path: string) {
  if (path.includes('.')) {
    const [ext = ''] = path.split('.').reverse()
    return `.${ext.toLowerCase()}`
  }

  return ''
}

function isURLStaticAsset(path: string) {
  const fileExtension = getExtFromURL(path)
  return (
    fileExtension &&
    /(\.[a-z0-9]{2,11})$/i.test(path) &&
    !NON_STATIC_ASSET_EXTENSIONS.includes(fileExtension)
  )
}

const NON_STATIC_ASSET_MIME_TYPES = [
  'application/json',
  'multipart/form-data',
  'application/x-www-form-urlencoded',
  'text/html',
  'text/plain',
  'text/xml',
]

export const NON_STATIC_ASSET_EXTENSIONS = [
  '.html',
  '.jsp',
  '.aspx',
  '.asp',
  '.xml',
  '.php',
]
