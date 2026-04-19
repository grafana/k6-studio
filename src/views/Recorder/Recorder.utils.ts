import { debounce } from 'lodash-es'
import { useState, useMemo, useEffect } from 'react'

import { LaunchBrowserOptions } from '@/recorder/types'
import { ProxyData } from '@/types'

export { findCachedResponse, mergeRequestsById } from '@/utils/proxyMerge'

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
