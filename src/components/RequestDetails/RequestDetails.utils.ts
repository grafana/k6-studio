import { ProxyData, Request } from '@/types'

export function parseContent(data: ProxyData) {
  if (!data.response || data.request.method === 'OPTIONS') {
    return
  }

  const headersObj = data.response.headers.reduce(
    (acc, [key, value]) => {
      acc[key.toLowerCase()] = value
      return acc
    },
    {} as Record<string, string>
  )

  const contentType = headersObj['content-type']?.split(';')[0]

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

export function requestToFullUrl(request: Request) {
  return `${request.scheme}://${request.host}${request.path}`
}
