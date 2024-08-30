import { useCallback, useEffect, useRef, useState } from 'react'

import { ProxyData } from '@/types'
import {
  mergeRequestsById,
  findAndOverrideCachedResponse,
} from '@/views/Recorder/Recorder.utils'

export function useListenProxyData(group?: string) {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const groupRef = useRef(group)

  const resetProxyData = useCallback(() => {
    setProxyData([])
  }, [])

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for proxyData
    groupRef.current = group
  }, [group])

  useEffect(() => {
    return window.studio.proxy.onProxyData((data) => {
      setProxyData((s) => {
        if (data.response?.statusCode === 304) {
          findAndOverrideCachedResponse(s, data)
        }
        return mergeRequestsById(s, {
          ...data,
          group: groupRef.current,
        })
      })
    })
  }, [])

  return { proxyData, resetProxyData }
}
