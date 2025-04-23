import { debounce } from 'lodash-es'
import { useState, useMemo, useEffect } from 'react'

import { LaunchBrowserOptions } from '@/handlers/browser/types'
import { ProxyData, Request } from '@/types'
import { getContentTypeWithCharsetHeader, upsertHeader } from '@/utils/headers'

// We get 2 requests with the same id, one when
// the request is sent and another when the response is received
export function mergeRequestsById(previous: ProxyData[], proxyData: ProxyData) {
  const existingRequestIndex = previous.findIndex(
    (request) => request.id === proxyData.id
  )

  if (existingRequestIndex !== -1) {
    return previous.map((request) => {
      if (request.id === proxyData.id) {
        const previousRequest = previous[existingRequestIndex]
        return {
          ...proxyData,
          // When listening to k6 emitted events group is set only in the request event, so we need to copy it to response event
          group: proxyData.group ? proxyData.group : previousRequest?.group,
        }
      }

      return request
    })
  }

  return [
    ...previous,
    {
      ...proxyData,
      // k6 emmits group as comment property
      group: proxyData.group ?? proxyData.comment,
    },
  ]
}

export function findCachedResponse(
  previous: ProxyData[],
  proxyData: ProxyData
) {
  if (!proxyData.response) {
    return proxyData
  }

  const requestSignature = getRequestSignature(proxyData.request)
  const cachedResponse = previous.find(
    (data) => getRequestSignature(data.request) === requestSignature
  )

  if (!cachedResponse || !cachedResponse.response) {
    return proxyData
  }

  const cachedContentType = getContentTypeWithCharsetHeader(
    cachedResponse.response.headers
  )
  const headers = upsertHeader(
    proxyData.response.headers,
    'content-type',
    cachedContentType ?? ''
  )

  return {
    ...proxyData,
    response: {
      ...proxyData.response,
      headers,
      content: cachedResponse.response.content,
    },
  }
}

function getRequestSignature(request: Request) {
  return `${request.method} ${request.url}`
}

export function getHostNameFromURL(url?: string) {
  // ensure that a URL without protocol is parsed correctly
  const urlWithProtocol = url?.startsWith('http') ? url : `http://${url}`
  try {
    return new URL(urlWithProtocol).hostname
  } catch {
    return undefined
  }
}

// TODO: add error and timeout handling
export async function startRecording(options: LaunchBrowserOptions) {
  // Kill previous browser window
  window.studio.browser.stopBrowser()

  return window.studio.browser.launchBrowser(options)
}

export function stopRecording() {
  window.studio.browser.stopBrowser()
}

export const useDebouncedProxyData = (proxyData: ProxyData[]): ProxyData[] => {
  const [debouncedProxyData, setDebouncedProxyData] = useState<ProxyData[]>([])

  const debouncedSetProxyData = useMemo(
    () => debounce(setDebouncedProxyData, 100),
    []
  )

  useEffect(() => {
    debouncedSetProxyData(proxyData)
  }, [proxyData, debouncedSetProxyData])

  return debouncedProxyData
}
