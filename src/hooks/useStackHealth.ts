import { useQuery } from '@tanstack/react-query'

const QUERY_KEY = ['assistant-stack-health'] as const
const WAKE_QUERY_KEY = ['assistant-stack-wake'] as const
const POLL_INTERVAL_MS = 3000

/**
 * Grafana Cloud rate limits wake attempts per client IP, and forces its captcha
 * on an instance that would otherwise have woken on its own once tripped. Reuse
 * the last answer for roughly that window so reopening the gate a few times
 * doesn't create the captcha we're trying to report.
 */
const WAKE_THROTTLE_MS = 15 * 60 * 1000

export function useStackHealth(enabled: boolean) {
  const wake = useQuery({
    queryKey: WAKE_QUERY_KEY,
    queryFn: () => window.studio.ai.assistantWakeStack(),
    networkMode: 'always',
    staleTime: WAKE_THROTTLE_MS,
    refetchOnReconnect: false,
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
