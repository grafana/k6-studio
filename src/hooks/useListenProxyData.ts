import { useEffect, useRef } from 'react'

import { useRecorderStore } from '@/store/recorder/useRecorderStore'

export function useListenProxyData(group?: string) {
  const { resetProxyData, addRequest } = useRecorderStore()
  const groupRef = useRef(group)

  useEffect(() => {
    return () => {
      resetProxyData()
    }
  }, [resetProxyData])

  useEffect(() => {
    // Create ref to avoid creating multiple listeners
    // for proxyData
    groupRef.current = group
  }, [group])

  useEffect(() => {
    return window.studio.proxy.onProxyData((data) => {
      addRequest(data, groupRef.current ?? 'default')
    })
  }, [addRequest])
}
