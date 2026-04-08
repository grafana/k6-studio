import http from 'node:http'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CallbackResult,
  exchangeAssistantCode,
  handleCallbackRequest,
  startCallbackServer,
} from './assistantAuth'

describe('exchangeAssistantCode', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.resetAllMocks()
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

  it('rejects when signal is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    mockFetch.mockImplementation((_url: string, init: RequestInit) => {
      if (init.signal?.aborted) {
        return Promise.reject(
          new DOMException('The operation was aborted.', 'AbortError')
        )
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(validResponse),
      })
    })

    await expect(
      exchangeAssistantCode(
        'https://api.grafana.net',
        'code',
        'verifier',
        controller.signal
      )
    ).rejects.toThrow('The operation was aborted.')
  })

  it('passes signal to fetch so it can be aborted externally', async () => {
    const controller = new AbortController()

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(validResponse),
    })

    await exchangeAssistantCode(
      'https://api.grafana.net',
      'code',
      'verifier',
      controller.signal
    )

    const fetchOptions = mockFetch.mock.calls[0]![1] as RequestInit
    // Signal should respond to the external controller, not just a timeout
    controller.abort()
    expect(fetchOptions.signal?.aborted).toBe(true)
  })
})

describe('handleCallbackRequest', () => {
  function createMockServer() {
    const server = new http.Server()
    return server
  }

  function emitRequest(server: http.Server, url: string) {
    const req = { url } as http.IncomingMessage
    const writeHead = vi.fn()
    const end = vi.fn((_data?: unknown, cb?: () => void) => {
      cb?.()
    })
    const res = { writeHead, end } as unknown as http.ServerResponse

    server.emit('request', req, res)

    return { writeHead, end }
  }

  it('returns 404 for non-/callback paths', () => {
    const server = createMockServer()
    void handleCallbackRequest(server)

    const { writeHead, end } = emitRequest(server, '/favicon.ico')

    expect(writeHead).toHaveBeenCalledWith(404)
    expect(end).toHaveBeenCalled()
  })

  it('resolves with callback data on success', async () => {
    const server = createMockServer()
    const result = handleCallbackRequest(server)

    emitRequest(
      server,
      '/callback?code=abc&state=xyz&endpoint=https://api.grafana.net&tenant=t1&email=a@b.com'
    )

    await expect(result).resolves.toEqual({
      code: 'abc',
      state: 'xyz',
      endpoint: 'https://api.grafana.net',
      tenant: 't1',
      email: 'a@b.com',
    } satisfies CallbackResult)
  })

  it('rejects with error when error param is present', async () => {
    const server = createMockServer()
    const result = handleCallbackRequest(server)

    emitRequest(server, '/callback?error=user_cancelled&state=xyz')

    await expect(result).rejects.toThrow('Authorization denied: user_cancelled')
  })

  it('rejects when code or state is missing', async () => {
    const server = createMockServer()
    const result = handleCallbackRequest(server)

    emitRequest(server, '/callback?code=abc')

    await expect(result).rejects.toThrow(
      'Missing code or state in auth callback'
    )
  })
})

describe('startCallbackServer', () => {
  function sendCallback(port: number, state: string) {
    return new Promise<void>((resolve) => {
      http
        .get(
          `http://127.0.0.1:${port}/callback?error=user_cancelled&state=${state}`,
          (res) => {
            res.resume()
            res.on('end', resolve)
          }
        )
        .end()
    })
  }

  it('assigns a port and rejects on cancel callback', async () => {
    const ctrl = new AbortController()
    const { port, result } = await startCallbackServer(ctrl.signal)

    expect(port).toBeGreaterThanOrEqual(1024)

    await sendCallback(port, 's1')
    await expect(result).rejects.toThrow('Authorization denied')
  })

  it('handles sequential cancel-and-retry without hanging', async () => {
    const ctrl1 = new AbortController()
    const { port: port1, result: result1 } = await startCallbackServer(
      ctrl1.signal
    )

    await sendCallback(port1, 's1')
    await expect(result1).rejects.toThrow('Authorization denied')

    const ctrl2 = new AbortController()
    const { port: port2, result: result2 } = await startCallbackServer(
      ctrl2.signal
    )

    expect(port2).not.toBe(port1)

    await sendCallback(port2, 's2')
    await expect(result2).rejects.toThrow('Authorization denied')
  })
})
