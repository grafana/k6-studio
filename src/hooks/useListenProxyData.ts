import { useCallback, useEffect, useRef, useState } from 'react'

import { ProxyData } from '@/types'
import { processProxyData } from '@/utils/proxyData'

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
    const unsubscribe = window.studio.proxy.onProxyData((data) => {
      setProxyData((prevData) =>
        processProxyData(prevData, data, groupRef.current)
      )
    })

    return unsubscribe
  }, [])

  return { proxyData, resetProxyData }
}
