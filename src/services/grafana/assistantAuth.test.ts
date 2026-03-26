import http from 'node:http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CallbackResult,
  exchangeAssistantCode,
  handleCallbackRequest,
} from './assistantAuth'

describe('exchangeAssistantCode', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const validResponse = {
    data: {
      token: 'access-token',
      refresh_token: 'refresh-token',
      expires_at: '2026-04-01T00:00:00Z',
      refresh_expires_at: '2026-05-01T00:00:00Z',
      api_endpoint: 'https://api.grafana.net',
    },
  }

  it('returns parsed token data on success', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validResponse),
    })

    const result = await exchangeAssistantCode(
      'https://api.grafana.net',
      'code123',
      'verifier123'
    )

    expect(result.token).toBe('access-token')
    expect(result.refresh_token).toBe('refresh-token')
    expect(result.api_endpoint).toBe('https://api.grafana.net')
  })

  it('throws on non-200 response with body', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    })

    await expect(
      exchangeAssistantCode('https://api.grafana.net', 'code', 'verifier')
    ).rejects.toThrow('Assistant auth exchange failed (401): Unauthorized')
  })

  it('throws with fallback when response body read fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.reject(new Error('read error')),
    })

    await expect(
      exchangeAssistantCode('https://api.grafana.net', 'code', 'verifier')
    ).rejects.toThrow('Assistant auth exchange failed (500): Unknown error')
  })

  it('throws on invalid response shape', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ wrong: 'shape' }),
    })

    await expect(
      exchangeAssistantCode('https://api.grafana.net', 'code', 'verifier')
    ).rejects.toThrow()
  })

  it('throws on missing fields in response', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { token: 'ok' } }), // missing other fields
    })

    await expect(
      exchangeAssistantCode('https://api.grafana.net', 'code', 'verifier')
    ).rejects.toThrow()
  })
})

describe('handleCallbackRequest', () => {
  function createMockReqRes(url: string) {
    const req = { url } as http.IncomingMessage
    const writeHead = vi.fn()
    const end = vi.fn()
    const res = { writeHead, end } as unknown as http.ServerResponse
    return { req, res, writeHead, end }
  }

  it('returns 404 for non-/callback paths', () => {
    const { req, res, writeHead, end } = createMockReqRes('/favicon.ico')
    const closeServer = vi.fn()
    const resolve = vi.fn()
    const reject = vi.fn()

    handleCallbackRequest(req, res, closeServer, resolve, reject)

    expect(writeHead).toHaveBeenCalledWith(404)
    expect(end).toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()
    expect(reject).not.toHaveBeenCalled()
    expect(closeServer).not.toHaveBeenCalled()
  })

  it('resolves with callback data on success', () => {
    const { req, res } = createMockReqRes(
      '/callback?code=abc&state=xyz&endpoint=https://api.grafana.net&tenant=t1&email=a@b.com'
    )
    const closeServer = vi.fn()
    const resolve = vi.fn()
    const reject = vi.fn()

    handleCallbackRequest(req, res, closeServer, resolve, reject)

    expect(resolve).toHaveBeenCalledWith({
      code: 'abc',
      state: 'xyz',
      endpoint: 'https://api.grafana.net',
      tenant: 't1',
      email: 'a@b.com',
    } satisfies CallbackResult)
    expect(reject).not.toHaveBeenCalled()
    expect(closeServer).toHaveBeenCalled()
  })

  it('rejects with error when error param is present', () => {
    const { req, res } = createMockReqRes(
      '/callback?error=user_cancelled&state=xyz'
    )
    const closeServer = vi.fn()
    const resolve = vi.fn()
    const reject = vi.fn()

    handleCallbackRequest(req, res, closeServer, resolve, reject)

    expect(reject).toHaveBeenCalledWith(
      new Error('Authorization denied: user_cancelled')
    )
    expect(resolve).not.toHaveBeenCalled()
    expect(closeServer).toHaveBeenCalled()
  })

  it('rejects when code or state is missing', () => {
    const { req, res } = createMockReqRes('/callback?code=abc')
    const closeServer = vi.fn()
    const resolve = vi.fn()
    const reject = vi.fn()

    handleCallbackRequest(req, res, closeServer, resolve, reject)

    expect(reject).toHaveBeenCalledWith(
      new Error('Missing code or state in auth callback')
    )
    expect(resolve).not.toHaveBeenCalled()
    expect(closeServer).toHaveBeenCalled()
  })
})
