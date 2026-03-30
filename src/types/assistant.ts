export type AssistantErrorCategory =
  | 'auth-expired'
  | 'no-stack'
  | 'rate-limit'
  | 'quota-exceeded'
  | 'context-window'
  | 'service-unavailable'
  | 'network'
  | 'unknown'

export interface AssistantErrorInfo {
  category: AssistantErrorCategory
  message: string
  upgradeUrl?: string
}

export function isRetryable(category: AssistantErrorCategory): boolean {
  return (
    category === 'rate-limit' ||
    category === 'service-unavailable' ||
    category === 'network' ||
    category === 'unknown'
  )
}
