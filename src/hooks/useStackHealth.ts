import { useQuery } from '@tanstack/react-query'

const QUERY_KEY = ['assistant-stack-health'] as const
const WAKE_QUERY_KEY = ['assistant-stack-wake'] as const
const POLL_INTERVAL_MS = 3000

export function useStackHealth(enabled: boolean) {
  const wake = useQuery({
    queryKey: WAKE_QUERY_KEY,
    queryFn: () => window.studio.ai.assistantWakeStack(),
    networkMode: 'always',
    staleTime: Infinity,
    enabled,
  })

  const health = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => window.studio.ai.assistantCheckStackHealth(),
    networkMode: 'always',
    refetchInterval: (result) =>
      result.state.data === 'ready' ? false : POLL_INTERVAL_MS,
    enabled,
  })

  const isStackReady = !enabled || health.data === 'ready'
  const captchaUrl =
    !isStackReady && wake.data?.status === 'captcha-required'
      ? wake.data.url
      : null

  return { isStackReady, captchaUrl }
}
