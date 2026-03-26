import log from 'electron-log/main'

import {
  AssistantTokenData,
  getAssistantTokens,
  saveAssistantTokens,
} from './tokenStore'

const PREFIX = '[GrafanaAssistant]'

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

interface RefreshResponse {
  token: string
  refresh_token: string
  expires_at: string
  refresh_expires_at: string
}

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

  log.info(PREFIX, 'Refreshing assistant token for stack', stackId)

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

  const data = (await response.json()) as RefreshResponse

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
    log.error(PREFIX, 'Failed to refresh assistant token:', error)
    return null
  }
}
