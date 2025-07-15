import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

import { ProxyStatus } from '@/types'

export function useProxyHealthCheck(proxyStatus?: ProxyStatus) {
  const { data: isProxyHealthy, refetch } = useQuery({
    queryKey: ['proxy-health'],
    queryFn: () => window.studio.proxy.checkProxyHealth(),
    networkMode: 'always',
    placeholderData: true,
    // only refetch when the proxy is unhealthy
    refetchInterval: (isProxyHealthy) =>
      isProxyHealthy.state.data ? false : 2000,
    // Only start the health check if the proxy is online, to avoid showing
    // false unhealthy state in recorder
    enabled: proxyStatus === undefined || proxyStatus === 'online',
  })

  useEffect(() => {
    // This auto-refetch is needed to handle cases where you change your settings (from unhealthy to healthy) with the Recorder page opened.
    // This ensures that a new health check is performed as soon as the proxy restarts (without need to reopen the page again).
    const fetchProxyHealth = async () => {
      if (proxyStatus === 'online') {
        await refetch()
      }
    }
    void fetchProxyHealth()
  }, [proxyStatus, refetch])

  return { isProxyHealthy, refetchProxyHealth: refetch }
}
