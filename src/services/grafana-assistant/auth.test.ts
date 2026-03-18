import { beforeEach, describe, expect, it, vi } from 'vitest'

import { buildAuthUrl, exchangeCodeForTokens } from './auth'

global.fetch = vi.fn()

describe('buildAuthUrl', () => {
  it('builds a correct auth URL', () => {
    const url = buildAuthUrl(
      'https://grafana.example.com',
      54321,
      'test-state',
      'test-challenge'
    )

    expect(url).toBe(
      'https://grafana.example.com/a/grafana-assistant-app/cli/auth' +
        '?callback_port=54321&state=test-state&code_challenge=test-challenge' +
        '&code_challenge_method=S256&scopes=assistant%3Achat%2Cassistant%3Aa2a'
    )
  })

  it('strips trailing slash from grafanaUrl', () => {
    const url = buildAuthUrl(
      'https://grafana.example.com/',
      54321,
      'state',
      'challenge'
    )

    expect(url).toContain('https://grafana.example.com/a/grafana-assistant-app')
    expect(url).not.toContain('https://grafana.example.com//a')
  })

  it('includes all required scopes', () => {
    const url = buildAuthUrl('https://example.com', 1234, 'state', 'challenge')
    const parsed = new URL(url)
    expect(parsed.searchParams.get('scopes')).toBe(
      'assistant:chat,assistant:a2a'
    )
  })

  it('uses S256 as code challenge method', () => {
    const url = buildAuthUrl('https://example.com', 1234, 'state', 'challenge')
    const parsed = new URL(url)
    expect(parsed.searchParams.get('code_challenge_method')).toBe('S256')
  })
})

describe('exchangeCodeForTokens', () => {
  const mockedFetch = vi.mocked(fetch)
  const endpoint = 'https://grafana.example.com'
  const code = 'auth-code-123'
  const codeVerifier = 'verifier-abc'

  const mockResponseData = {
    data: {
      token: 'gat-token',
      refresh_token: 'gar-token',
      api_endpoint: 'https://api.example.com',
      expires_at: '2026-12-31T00:00:00Z',
      refresh_expires_at: '2027-12-31T00:00:00Z',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('exchanges code for tokens successfully', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    } as Response)

    const tokens = await exchangeCodeForTokens(endpoint, code, codeVerifier)

    expect(tokens).toEqual({
      gatToken: 'gat-token',
      garToken: 'gar-token',
      apiEndpoint: 'https://api.example.com',
      expiresAt: '2026-12-31T00:00:00Z',
      refreshExpiresAt: '2027-12-31T00:00:00Z',
    })
  })

  it('posts to the correct endpoint URL', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    } as Response)

    await exchangeCodeForTokens(endpoint, code, codeVerifier)

    expect(mockedFetch).toHaveBeenCalledWith(
      'https://grafana.example.com/api/cli/v1/auth/exchange',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, code_verifier: codeVerifier }),
      })
    )
  })

  it('strips trailing slash from endpoint', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    } as Response)

    await exchangeCodeForTokens(
      'https://grafana.example.com/',
      code,
      codeVerifier
    )

    const [url] = mockedFetch.mock.calls[0]!
    expect(url as string).toBe(
      'https://grafana.example.com/api/cli/v1/auth/exchange'
    )
  })

  it('throws when the response is not ok', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    } as Response)

    await expect(
      exchangeCodeForTokens(endpoint, code, codeVerifier)
    ).rejects.toThrow('Token exchange failed (401): Unauthorized')
  })

  it('forwards the AbortSignal to fetch', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponseData),
    } as Response)

    const controller = new AbortController()
    await exchangeCodeForTokens(endpoint, code, codeVerifier, controller.signal)

    expect(mockedFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    )
  })

  it('propagates AbortError when request is aborted', async () => {
    const controller = new AbortController()
    const abortError = new DOMException('Aborted', 'AbortError')
    mockedFetch.mockRejectedValueOnce(abortError)

    controller.abort()
    await expect(
      exchangeCodeForTokens(endpoint, code, codeVerifier, controller.signal)
    ).rejects.toThrow('Aborted')
  })
})
