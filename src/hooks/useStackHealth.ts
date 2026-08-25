import { useQuery } from '@tanstack/react-query'

import { useAssistantAuthStatus } from '@/hooks/useAssistantAuth'

const POLL_INTERVAL_MS = 3000

/**
 * Grafana Cloud limits wake requests per client IP and shows its captcha when
 * that limit is reached, so reopening the gate uses the last answer for this long.
 */
const WAKE_THROTTLE_MS = 15 * 60 * 1000

export function useStackHealth(enabled: boolean) {
  const { data: authStatus } = useAssistantAuthStatus()
  // Both answers describe one instance, so a stack switch must not reuse them.
  const stackId = authStatus?.stackId
  const isEnabled = enabled && !!stackId

  const wake = useQuery({
    queryKey: ['assistant-stack-wake', stackId],
    queryFn: () => window.studio.ai.assistantWakeStack(),
    networkMode: 'always',
    staleTime: WAKE_THROTTLE_MS,
    // Keeping the entry at least as long as the throttle, or it is evicted
    // after the default five minutes and the next open wakes the stack again.
    gcTime: WAKE_THROTTLE_MS,
    refetchOnReconnect: false,
    enabled: isEnabled,
  })

  const health = useQuery({
    queryKey: ['assistant-stack-health', stackId],
    queryFn: () => window.studio.ai.assistantCheckStackHealth(),
    networkMode: 'always',
    refetchInterval: (result) =>
      result.state.data === 'ready' ? false : POLL_INTERVAL_MS,
    enabled: isEnabled,
  })

  const isStackReady = !enabled || health.data === 'ready'
  const captchaUrl =
    !isStackReady && wake.data?.status === 'captcha-required'
      ? wake.data.url
      : null

  return { isStackReady, captchaUrl }
}
