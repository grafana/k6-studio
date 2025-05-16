import { useQuery } from '@tanstack/react-query'

export function useProxyHealthCheck() {
  const { data: isProxyHealthy, refetch } = useQuery({
    queryKey: ['proxy-health'],
    queryFn: () => window.studio.proxy.checkProxyHealth(),
    networkMode: 'always',
    placeholderData: true,
    // only refetch when the proxy is unhealthy
    refetchInterval: (isProxyHealthy) =>
      isProxyHealthy.state.data ? false : 2000,
  })

  return { isProxyHealthy, refetchProxyHealth: refetch }
}
