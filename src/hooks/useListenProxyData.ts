import { useEffect, useRef } from 'react'

import { useRecorderStore } from './useRecorderStore'

export function useListenProxyData(group?: string) {
  const { addRequest } = useRecorderStore()
  const groupRef = useRef(group)

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
