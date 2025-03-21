import { ProxyData, Response } from '@/types'

import { safeAtob } from '../format'

function parseResponse(response: Response): Response {
  const content = response.content ? safeAtob(response.content) : ''

  return {
    ...response,
    content,
  }
}

export function recordingToProxyData(data: ProxyData[]): ProxyData[] {
  return data.map((entry) => ({
    ...entry,
    response: entry.response ? parseResponse(entry.response) : undefined,
  }))
}
