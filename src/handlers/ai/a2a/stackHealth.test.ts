import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  checkStackHealth,
  wakeStack,
  type StackHealthStatus,
} from './stackHealth'

const mockFetch = vi.fn()
const stackUrl = 'https://mystack.grafana.net'

beforeEach(() => {
  mockFetch.mockClear()
  vi.stubGlobal('fetch', mockFetch)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('wakeStack', () => {
  it('sends a request to /login with disableAutoLogin', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(''),
    })

    await wakeStack(stackUrl)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://mystack.grafana.net/login?disableAutoLogin=true',
      expect.objectContaining({
        signal: expect.any(AbortSignal) as AbortSignal,
      })
    )
  })

  it('does not throw when the request fails', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(wakeStack(stackUrl)).resolves.toBeUndefined()
  })
})

describe('checkStackHealth', () => {
  it('returns "ready" when health endpoint returns 200 with database ok', async () => {
    mockFetch.mockResolvedValueOnce({
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
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when database is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'failing' }),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when response is not JSON (HTML loading page)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when health check fails (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('uses a timeout to avoid hanging on unresponsive stacks', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth(stackUrl)

    const healthInit = mockFetch.mock.calls[0]![1] as RequestInit
    expect(healthInit.signal).toBeInstanceOf(AbortSignal)
  })

  it('does not call wakeStack', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth(stackUrl)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/health'),
      expect.any(Object)
    )
  })
})
