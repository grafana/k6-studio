import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

const QUERY_KEY = ['assistant-stack-health'] as const
const POLL_INTERVAL_MS = 3000

export function useStackHealth(enabled: boolean) {
  useEffect(() => {
    if (enabled) {
      void window.studio.ai.assistantWakeStack()
    }
  }, [enabled])

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: window.studio.ai.assistantCheckStackHealth,
    networkMode: 'always',
    placeholderData: 'ready' as const,
    refetchInterval: (result) =>
      result.state.data === 'ready' ? false : POLL_INTERVAL_MS,
    enabled,
  })

  return {
    ...query,
    isStackReady: query.data === 'ready',
  }
}
