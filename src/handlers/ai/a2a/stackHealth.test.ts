import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  checkStackHealth,
  wakeStack,
  type StackHealthStatus,
  type StackWakeResult,
} from './stackHealth'

const mockFetch = vi.fn()
const stackUrl = 'https://mystack.grafana.net'

/** What the gateway sends while a hibernating instance waits for the captcha. */
const HIBERNATING_BODY = JSON.stringify({
  code: 'Loading',
  message: 'Click on the checkbox to continue loading your instance',
})

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

  it('returns "awake" when the stack serves the login page', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html>login</html>'),
    })

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'awake',
    } satisfies StackWakeResult)
  })

  it('returns "captcha-required" when the instance is hibernating', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: () => Promise.resolve(HIBERNATING_BODY),
    })

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'captcha-required',
      url: stackUrl,
    } satisfies StackWakeResult)
  })

  it('returns "loading" when the instance is booting without a captcha', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            code: 'Loading',
            message: 'Your instance is loading, and will be ready shortly.',
          })
        ),
    })

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'loading',
    } satisfies StackWakeResult)
  })

  it('returns "loading" for a maintenance response without a code', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: () => Promise.resolve(JSON.stringify({ message: 'Maintenance' })),
    })

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'loading',
    } satisfies StackWakeResult)
  })

  it('returns "loading" for other gateway states', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: () =>
        Promise.resolve(
          JSON.stringify({
            code: 'Migrating',
            message: 'Your instance is being migrated.',
          })
        ),
    })

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'loading',
    } satisfies StackWakeResult)
  })

  it('returns "loading" when the error body is not JSON', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: () => Promise.resolve('<html>Bad gateway</html>'),
    })

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'loading',
    } satisfies StackWakeResult)
  })

  it('returns "loading" when the request fails', async () => {
    mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    await expect(wakeStack(stackUrl)).resolves.toEqual({
      status: 'loading',
    } satisfies StackWakeResult)
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

  it('returns "loading" when a hibernating instance 404s the health endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
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
})
