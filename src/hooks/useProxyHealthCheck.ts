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
  })

  useEffect(() => {
    const fetchProxyHealth = async () => {
      if (proxyStatus === 'online') {
        await refetch()
      }
    }
    void fetchProxyHealth()
  }, [proxyStatus, refetch])

  return { isProxyHealthy, refetchProxyHealth: refetch }
}
