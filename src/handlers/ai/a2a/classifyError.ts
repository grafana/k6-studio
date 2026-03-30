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
  apiEndpoint?: string
}

export function classifyError(
  message: string,
  options: ClassifyOptions = {}
): AssistantErrorInfo {
  const { httpStatus, isTypeError, apiEndpoint } = options
  const lowerMessage = message.toLowerCase()

  if (
    isTypeError ||
    lowerMessage.includes('failed to fetch') ||
    lowerMessage.includes('fetch failed')
  ) {
    return {
      category: 'network',
      message,
    }
  }

  if (httpStatus === 401 || httpStatus === 403) {
    return { category: 'auth-expired', message }
  }

  if (httpStatus === 429) {
    if (
      message.includes('RESOURCE_LIMIT_EXCEEDED') ||
      lowerMessage.includes('quota')
    ) {
      return {
        category: 'quota-exceeded',
        message,
        upgradeUrl: buildUpgradeUrl(apiEndpoint),
      }
    }
    return { category: 'rate-limit', message }
  }

  if (httpStatus === 503) {
    return { category: 'service-unavailable', message }
  }

  if (lowerMessage.includes('no grafana cloud stack')) {
    return { category: 'no-stack', message }
  }

  if (
    lowerMessage.includes('not authenticated') ||
    lowerMessage.includes('unauthorized') ||
    lowerMessage.includes('permission') ||
    lowerMessage.includes('refresh token') ||
    lowerMessage.includes('token refresh failed')
  ) {
    return { category: 'auth-expired', message }
  }

  if (
    message.includes('RESOURCE_LIMIT_EXCEEDED') ||
    lowerMessage.includes('quota exceeded') ||
    lowerMessage.includes('prompt limit')
  ) {
    return {
      category: 'quota-exceeded',
      message,
      upgradeUrl: buildUpgradeUrl(apiEndpoint),
    }
  }

  if (
    lowerMessage.includes('context window') ||
    lowerMessage.includes('token limit') ||
    lowerMessage.includes('too many tokens')
  ) {
    return { category: 'context-window', message }
  }

  return { category: 'unknown', message }
}

function buildUpgradeUrl(apiEndpoint?: string): string {
  if (!apiEndpoint) {
    return 'https://grafana.com'
  }

  try {
    const url = new URL(apiEndpoint)
    const hostname = url.hostname
    // Extract org slug from hostname (e.g., "my-stack.grafana.net" → "my-stack")
    const orgSlug = hostname.split('.')[0]
    if (orgSlug) {
      return `https://grafana.com/orgs/${orgSlug}/my-account/manage-plan`
    }
  } catch {
    // Fall through to default
  }

  return 'https://grafana.com'
}
