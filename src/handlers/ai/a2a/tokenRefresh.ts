import log from 'electron-log/main'
import { z } from 'zod'

import { LOG_PREFIX } from './constants'
import {
  AssistantTokenData,
  getAssistantTokens,
  saveAssistantTokens,
} from './tokenStore'

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes
const MIN_REFRESH_DELAY_MS = 30 * 1000
const MAX_REFRESH_RETRIES = 3

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
    const text = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Assistant token refresh failed (${response.status}): ${text}`
    )
  }

  const body = RefreshResponseSchema.parse(await response.json())
  const data = body.data

  const refreshedTokens: AssistantTokenData = {
    accessToken: data.token,
    refreshToken: data.refresh_token,
    apiEndpoint: tokens.apiEndpoint,
    expiresAt: new Date(data.expires_at).getTime(),
    refreshExpiresAt: new Date(data.refresh_expires_at).getTime(),
  }

  await saveAssistantTokens(stackId, refreshedTokens)

  return refreshedTokens
}

let refreshTimer: ReturnType<typeof setTimeout> | null = null
let retryCount = 0

// After a token refresh, the A2A server needs time to recognize the new token.
// If we refresh on-demand (when the old token is already expired), requests
// fail with "Permission check failed" until the server catches up.
// Refreshing proactively while the old token is still valid avoids this.
export function scheduleTokenRefresh(
  stackId: string,
  tokens: AssistantTokenData
) {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
  }

  // Reset retry count when scheduling a new refresh cycle
  retryCount = 0

  const delay = Math.max(
    MIN_REFRESH_DELAY_MS,
    tokens.expiresAt - REFRESH_THRESHOLD_MS - Date.now()
  )

  log.info(
    LOG_PREFIX,
    `Scheduled token refresh in ${Math.round(delay / 1000)}s`
  )

  refreshTimer = setTimeout(async () => {
    refreshTimer = null

    try {
      const currentTokens = await getAssistantTokens(stackId)
      if (!currentTokens) {
        return
      }

      const refreshed = await refreshAndSaveTokens(stackId, currentTokens)
      retryCount = 0
      scheduleTokenRefresh(stackId, refreshed)
    } catch (error) {
      log.error(LOG_PREFIX, 'Scheduled token refresh failed:', error)

      retryCount++
      if (retryCount < MAX_REFRESH_RETRIES) {
        scheduleTokenRefresh(stackId, tokens)
      } else {
        log.error(LOG_PREFIX, 'Max refresh retries reached, giving up')
        retryCount = 0
      }
    }
  }, delay)
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
