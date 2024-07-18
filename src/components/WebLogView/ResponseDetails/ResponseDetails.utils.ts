import { ProxyData } from '@/types'
import { stringify } from '@/utils/format'

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
    case 'application/json':
      return 'json'
    case 'text/html':
      return 'html'
    case 'text/javascript':
      return 'javascript'
    case 'text/plain':
      return 'plain'
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
        return stringify(JSON.parse(atob(content)))
      case 'html':
      case 'javascript':
      case 'plain':
        return atob(content)
      case 'audio':
      case 'font':
      case 'image':
      case 'video':
        return content
      default:
        return
    }
  } catch (e) {
    // TODO: add catchers around the JSON.parse and atob calls only, this may swallow other errors
    console.error('Failed to parse content', e)
    return
  }
}
