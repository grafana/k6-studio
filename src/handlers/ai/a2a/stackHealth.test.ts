import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { checkStackHealth, type StackHealthStatus } from './stackHealth'

describe('checkStackHealth', () => {
  const mockFetch = vi.fn()
  const stackUrl = 'https://mystack.grafana.net'

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockWakeResponse() {
    return {
      ok: true,
      text: () => Promise.resolve(''),
    }
  }

  it('sends a wake request to /login before checking health', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth(stackUrl)

    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://mystack.grafana.net/login?disableAutoLogin=true',
      expect.objectContaining({
        signal: expect.any(AbortSignal) as AbortSignal,
      })
    )
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://mystack.grafana.net/api/health',
      expect.objectContaining({
        signal: expect.any(AbortSignal) as AbortSignal,
      })
    )
  })

  it('returns "ready" when health endpoint returns 200 with database ok', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          database: 'ok',
          version: '11.0.0',
          commit: 'abc123',
        }),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('ready')
  })

  it('returns "loading" when health endpoint returns 503', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: false,
      status: 503,
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when database is not ok', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'failing' }),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when response is not JSON (HTML loading page)', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when health check fails (network error)', async () => {
    mockFetch
      .mockResolvedValueOnce(mockWakeResponse())
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('still checks health when wake request fails', async () => {
    mockFetch
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ database: 'ok' }),
      })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('ready')
  })

  it('normalizes trailing slash in stack URL', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth('https://mystack.grafana.net/')

    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      'https://mystack.grafana.net/login?disableAutoLogin=true',
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      'https://mystack.grafana.net/api/health',
      expect.any(Object)
    )
  })

  it('uses a timeout to avoid hanging on unresponsive stacks', async () => {
    mockFetch.mockResolvedValueOnce(mockWakeResponse()).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth(stackUrl)

    const healthInit = mockFetch.mock.calls[1]![1] as RequestInit
    expect(healthInit.signal).toBeInstanceOf(AbortSignal)
  })
})
