import { ProxyData } from '@/types'
import { getContentType } from '@/utils/headers'

export function parseContent(data: ProxyData) {
  if (!data.response || data.request.method === 'OPTIONS') {
    return
  }

  const contentType = getContentType(data.response.headers)

  try {
    switch (contentType) {
      case 'application/json':
        return JSON.stringify(JSON.parse(atob(data.response.content)), null, 2)
      case 'text/html':
      case 'text/javascript':
      case 'text/plain':
        return atob(data.response.content)
      default:
        return
    }
  } catch (e) {
    // TODO: add catchers around the JSON.parse and atob calls only, this may swallow other errors
    console.error('Failed to parse content', e)
    return
  }
}