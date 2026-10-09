import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  getAssistantConnection,
  refreshAndSaveTokens,
  rejectAssistantSession,
} from './tokenRefresh'

const { store, clearAssistantTokensMock } = vi.hoisted(() => ({
  store: {
    expiry: {} as Record<
      string,
      { expiresAt: number; refreshExpiresAt: number }
    >,
  },
  clearAssistantTokensMock: vi.fn(),
}))
import type { AssistantTokenData } from './tokenStore'

vi.mock('./tokenStore', () => ({
  mapTokenResponse: (
    response: {
      token: string
      refresh_token: string
      expires_at: string
      refresh_expires_at: string
    },
    apiEndpoint: string
  ) => ({
    accessToken: response.token,
    refreshToken: response.refresh_token,
    apiEndpoint,
    expiresAt: new Date(response.expires_at).getTime(),
    refreshExpiresAt: new Date(response.refresh_expires_at).getTime(),
  }),
  saveAssistantTokens: vi.fn(),
  clearAssistantTokens: clearAssistantTokensMock,
  getAssistantTokenExpiry: (stackId: string) =>
    Promise.resolve(store.expiry[stackId] ?? null),
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
    vi.clearAllMocks()
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

  it('drops a refused refresh token so the session reads as gone', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('invalid_grant'),
    })

    await expect(refreshAndSaveTokens('1', validTokens)).rejects.toThrow()

    expect(clearAssistantTokensMock).toHaveBeenCalledWith('1')
  })

  it('keeps the tokens when the refresh fails for a transient reason', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: () => Promise.resolve('service unavailable'),
    })

    await expect(refreshAndSaveTokens('1', validTokens)).rejects.toThrow()

    expect(clearAssistantTokensMock).not.toHaveBeenCalled()
  })
})

describe('getAssistantConnection', () => {
  beforeEach(() => {
    store.expiry = {}
  })

  it('reports disconnected when no tokens are stored', async () => {
    await expect(getAssistantConnection('1')).resolves.toBe('disconnected')
  })

  it('reports expired when the refresh token has run out', async () => {
    store.expiry['1'] = {
      expiresAt: Date.now() - 86400_000,
      refreshExpiresAt: Date.now() - 1000,
    }

    await expect(getAssistantConnection('1')).resolves.toBe('expired')
  })

  it('reports connected while the refresh token is still valid', async () => {
    store.expiry['1'] = {
      expiresAt: Date.now() - 1000,
      refreshExpiresAt: Date.now() + 86400_000,
    }

    await expect(getAssistantConnection('1')).resolves.toBe('connected')
  })
})

describe('rejectAssistantSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    store.expiry = {}
  })

  it('drops tokens the server refused while they still look valid', async () => {
    // The case the stored expiry cannot see: an A2A 401 on a session whose
    // refresh token has not run out locally.
    store.expiry['1'] = {
      expiresAt: Date.now() + 60_000,
      refreshExpiresAt: Date.now() + 86400_000,
    }

    await rejectAssistantSession('1')

    expect(clearAssistantTokensMock).toHaveBeenCalledWith('1')
  })

  it('leaves tokens alone when they already read as expired', async () => {
    store.expiry['1'] = {
      expiresAt: Date.now() - 86400_000,
      refreshExpiresAt: Date.now() - 1000,
    }

    await rejectAssistantSession('1')

    expect(clearAssistantTokensMock).not.toHaveBeenCalled()
  })

  it('does nothing when no tokens are stored', async () => {
    await rejectAssistantSession('1')

    expect(clearAssistantTokensMock).not.toHaveBeenCalled()
  })
})
