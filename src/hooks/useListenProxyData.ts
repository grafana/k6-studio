import { ProxyData } from '@/types'
import { mergeRequestsById } from '@/views/Recorder/Recorder.utils'
import { useEffect, useRef, useState } from 'react'

export function useListenProxyData(group?: string) {
  const [proxyData, setProxyData] = useState<ProxyData[]>([])
  const groupRef = useRef(group)

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for proxyData
    groupRef.current = group
  }, [group])

  useEffect(() => {
    window.studio.proxy.onProxyData((data) => {
      setProxyData((prev) => {
        return mergeRequestsById([
          ...prev,
          { ...data, group: groupRef.current },
        ])
      })
    })
  }, [])

  return {
    proxyData,
    resetProxyData: () => setProxyData([]),
  }
}
