import type { AssistantErrorInfo } from '@/types/assistant'

export class AssistantError extends Error {
  readonly errorInfo: AssistantErrorInfo

  constructor(message: string, errorInfo: AssistantErrorInfo) {
    super(message)
    this.name = 'AssistantError'
    this.errorInfo = errorInfo
  }
}

interface ClassifyOptions {
  httpStatus?: number
  isTypeError?: boolean
}

export function classifyError(
  message: string,
  options: ClassifyOptions = {}
): AssistantErrorInfo {
  const { httpStatus, isTypeError } = options
  const lowerMessage = message.toLowerCase()

  if (
    isTypeError ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('fetch failed')
  ) {
    return { category: 'network', message }
  }

  if (
    lowerMessage.includes('limit reached') ||
    lowerMessage.includes('quota exceeded')
  ) {
    return { category: 'quota-exceeded', message }
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return { category: 'auth-expired', message }
  }

  if (
    lowerMessage.includes('not authenticated') ||
    lowerMessage.includes('refresh token') ||
    lowerMessage.includes('token refresh failed')
  ) {
    return { category: 'auth-expired', message }
  }

  return { category: 'unknown', message }
}
