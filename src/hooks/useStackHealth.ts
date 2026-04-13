import { useQuery } from '@tanstack/react-query'

const QUERY_KEY = ['assistant-stack-health'] as const
const POLL_INTERVAL_MS = 3000

export function useStackHealth(enabled: boolean) {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: window.studio.ai.assistantCheckStackHealth,
    networkMode: 'always',
    placeholderData: 'ready' as const,
    refetchInterval: (result) =>
      result.state.data === 'ready' ? false : POLL_INTERVAL_MS,
    enabled,
  })
  console.log('query', query.data)

  return {
    ...query,
    isStackReady: query.data === 'ready',
  }
}
