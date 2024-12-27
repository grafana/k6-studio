import { ProxyData } from '@/types'
import { isBase64, safeAtob, safeBtoa, stringify } from '@/utils/format'

export function toFormat(contentType: string | undefined) {
  if (!contentType) {
    return
  }

  if (contentType.includes('audio')) {
    return 'audio'
  }

  if (contentType.includes('font')) {
    return 'font'
  }

  if (contentType.includes('image')) {
    return 'image'
  }

  if (contentType.includes('video')) {
    return 'video'
  }

  switch (contentType) {
    case 'application/javascript':
      return 'javascript'
    case 'application/json':
    case 'application/manifest+json':
      return 'json'
    case 'text/css':
      return 'css'
    case 'text/html':
      return 'html'
    case 'text/plain':
      return 'plaintext'
    default:
      return
  }
}

export function parseContent(format: string | undefined, data: ProxyData) {
  const content = data.response?.content

  if (data.request.method === 'OPTIONS' || !content) {
    return
  }

  try {
    switch (format) {
      case 'json':
        // TODO: https://github.com/grafana/k6-studio/issues/277
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return stringify(JSON.parse(safeAtob(content)))
      case 'json-raw':
        // TODO: https://github.com/grafana/k6-studio/issues/277
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        return stringify(JSON.parse(safeAtob(content)), 0)
      case 'css':
      case 'html':
      case 'javascript':
      case 'plaintext':
        return isBase64(content) ? safeAtob(content) : content
      case 'audio':
      case 'font':
      case 'image':
      case 'video':
        return isBase64(content) ? content : safeBtoa(content)
      default:
        return
    }
  } catch (e) {
    console.error('Failed to parse content', e)
    return
  }
}
