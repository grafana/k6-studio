import { useEffect } from 'react'

import { useStudioUIStore } from '@/store/ui'

export function useProxyStatus() {
  const status = useStudioUIStore((state) => state.proxyStatus)
  const setProxyStatus = useStudioUIStore((state) => state.setProxyStatus)

  useEffect(() => {
    ;(async function fetchProxyStatus() {
      const status = await window.studio.proxy.getProxyStatus()
      setProxyStatus(status)
    })()

    return window.studio.proxy.onProxyStatusChange((status) =>
      setProxyStatus(status)
    )
  }, [setProxyStatus])

  return status
}
