import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { refreshAndSaveTokens, scheduleTokenRefresh } from './tokenRefresh'
import type { AssistantTokenData } from './tokenStore'

vi.mock('./tokenStore', () => ({
  saveAssistantTokens: vi.fn(),
  getAssistantTokens: vi.fn(),
}))

describe('refreshAndSaveTokens', () => {
  const mockFetch = vi.fn()
  const validTokens: AssistantTokenData = {
    accessToken: 'old-access',
    refreshToken: 'old-refresh',
    apiEndpoint: 'https://api.grafana.net',
    expiresAt: Date.now() - 1000,
    refreshExpiresAt: Date.now() + 86400_000,
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses wrapped response with data envelope', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'success',
          data: {
            token: 'new-access',
            refresh_token: 'new-refresh',
            expires_at: '2026-04-01T00:00:00Z',
            refresh_expires_at: '2026-05-01T00:00:00Z',
          },
        }),
    })

    const result = await refreshAndSaveTokens('stack-1', validTokens)

    expect(result.accessToken).toBe('new-access')
    expect(result.refreshToken).toBe('new-refresh')
    expect(result.apiEndpoint).toBe('https://api.grafana.net')
  })

  it('throws when refresh token is expired', async () => {
    const expiredTokens: AssistantTokenData = {
      ...validTokens,
      refreshExpiresAt: Date.now() - 1000,
    }

    await expect(
      refreshAndSaveTokens('stack-1', expiredTokens)
    ).rejects.toThrow('refresh token has expired')
  })

  it('throws on non-200 response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    })

    await expect(refreshAndSaveTokens('stack-1', validTokens)).rejects.toThrow(
      'Assistant token refresh failed (401)'
    )
  })
})

describe('scheduleTokenRefresh', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('fires refresh when timer elapses', async () => {
    const { getAssistantTokens } = await import('./tokenStore')

    const tokens: AssistantTokenData = {
      accessToken: 'access',
      refreshToken: 'refresh',
      apiEndpoint: 'https://api.grafana.net',
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min from now
      refreshExpiresAt: Date.now() + 86400_000,
    }

    // Return null to stop the refresh chain (simulates signed-out user)
    vi.mocked(getAssistantTokens).mockResolvedValue(null)

    scheduleTokenRefresh('stack-1', tokens)

    // Timer should fire at expiresAt - 5min = 5min from now
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    expect(getAssistantTokens).toHaveBeenCalledWith('stack-1')
  })

  it('skips refresh when tokens are cleared (signed out)', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)

    const { getAssistantTokens } = await import('./tokenStore')
    vi.mocked(getAssistantTokens).mockResolvedValue(null)

    const tokens: AssistantTokenData = {
      accessToken: 'access',
      refreshToken: 'refresh',
      apiEndpoint: 'https://api.grafana.net',
      expiresAt: Date.now() + 10 * 60 * 1000,
      refreshExpiresAt: Date.now() + 86400_000,
    }

    scheduleTokenRefresh('stack-1', tokens)
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000)

    // Should not attempt to refresh since tokens are null
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
