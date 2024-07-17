import { ProxyData } from '@/types'

export function parseParams(data: ProxyData) {
  const hasParams = data.request.query.length || data.request.content

  if (data.request.method === 'OPTIONS' || !data.response || !hasParams) {
    return
  }

  try {
    return data.request.query.length
      ? JSON.stringify(data.request.query, null, 2)
      : JSON.stringify(JSON.parse(atob(data.request.content)), null, 2)
  } catch (e) {
    console.error('Failed to parse query parameters', e)
    return
  }
}
