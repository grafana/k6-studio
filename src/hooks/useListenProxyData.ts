import { useEffect, useRef, useState } from 'react'

import { ProxyData } from '@/types'
import { mergeRequestsById } from '@/views/Recorder/Recorder.utils'

export function useListenProxyData(group?: string) {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const groupRef = useRef(group)

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for proxyData
    groupRef.current = group
  }, [group])

  useEffect(() => {
    return window.studio.proxy.onProxyData((data) => {
      setProxyData((s) =>
        mergeRequestsById(s, {
          ...data,
          group: groupRef.current ?? 'default',
        })
      )
    })
  }, [])

  return { proxyData, resetProxyData: () => setProxyData([]) }
}
