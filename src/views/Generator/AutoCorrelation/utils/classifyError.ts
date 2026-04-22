export type AssistantErrorCategory =
  | 'auth-expired'
  | 'quota-exceeded'
  | 'network'
  | 'unknown'

export interface AssistantErrorInfo {
  category: AssistantErrorCategory
  message: string
}

export function classifyError(message: string): AssistantErrorInfo {
  const lowerMessage = message.toLowerCase()

  if (
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('fetch failed')
  ) {
    return { category: 'network', message }
  }

  if (
    /limit.*reached/i.test(message) ||
    lowerMessage.includes('quota exceeded')
  ) {
    return { category: 'quota-exceeded', message }
  }

  if (
    /request failed \((401|403)\)/i.test(message) ||
    lowerMessage.includes('not authenticated') ||
    lowerMessage.includes('refresh token') ||
    lowerMessage.includes('token refresh failed')
  ) {
    return { category: 'auth-expired', message }
  }

  return { category: 'unknown', message }
}
