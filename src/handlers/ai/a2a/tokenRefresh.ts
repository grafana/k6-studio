import log from 'electron-log/main'
import { z } from 'zod'

import { LOG_PREFIX } from './constants'
import { safeResponseText } from './helpers'
import {
  type AssistantTokenData,
  getAssistantTokens,
  mapTokenResponse,
  saveAssistantTokens,
} from './tokenStore'

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

const RefreshResponseSchema = z.object({
  data: z.object({
    token: z.string(),
    refresh_token: z.string(),
    expires_at: z.string(),
    refresh_expires_at: z.string(),
  }),
})

export function isTokenExpiringSoon(tokens: AssistantTokenData): boolean {
  return Date.now() + REFRESH_THRESHOLD_MS >= tokens.expiresAt
}

export function isRefreshTokenExpired(tokens: AssistantTokenData): boolean {
  return Date.now() >= tokens.refreshExpiresAt
}

export async function refreshAndSaveTokens(
  stackId: string,
  tokens: AssistantTokenData
): Promise<AssistantTokenData> {
  if (isRefreshTokenExpired(tokens)) {
    throw new Error(
      'Assistant refresh token has expired. Please re-authenticate with Grafana Assistant.'
    )
  }

  log.info(LOG_PREFIX, 'Refreshing assistant token for stack', stackId)

  const response = await fetch(
    `${tokens.apiEndpoint}/api/cli/v1/auth/refresh`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: tokens.refreshToken }),
    }
  )

  if (!response.ok) {
    const text = await safeResponseText(response)
    throw new Error(
      `Assistant token refresh failed (${response.status}): ${text}`
    )
  }

  const body = RefreshResponseSchema.parse(await response.json())
  const refreshedTokens = mapTokenResponse(body.data, tokens.apiEndpoint)

  await saveAssistantTokens(stackId, refreshedTokens)

  return refreshedTokens
}

export async function getValidAssistantTokens(
  stackId: string
): Promise<AssistantTokenData | null> {
  const tokens = await getAssistantTokens(stackId)

  if (!tokens) {
    return null
  }

  if (!isTokenExpiringSoon(tokens)) {
    return tokens
  }

  try {
    return await refreshAndSaveTokens(stackId, tokens)
  } catch (error) {
    log.error(LOG_PREFIX, 'Failed to refresh assistant token:', error)
    return null
  }
}
