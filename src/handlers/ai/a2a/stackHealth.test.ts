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

  it('returns "ready" when health endpoint returns 200 with database ok', async () => {
    mockFetch.mockResolvedValue({
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
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mystack.grafana.net/api/health',
      expect.objectContaining({
        signal: expect.any(AbortSignal) as AbortSignal,
      })
    )
  })

  it('returns "loading" when health endpoint returns 503', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 503,
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when database is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ database: 'failing' }),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when response is not JSON (HTML loading page)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new SyntaxError('Unexpected token <')),
    })

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('returns "loading" when fetch fails (network error)', async () => {
    mockFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await checkStackHealth(stackUrl)

    expect(result).toBe<StackHealthStatus>('loading')
  })

  it('normalizes trailing slash in stack URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth('https://mystack.grafana.net/')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://mystack.grafana.net/api/health',
      expect.any(Object)
    )
  })

  it('uses a timeout to avoid hanging on unresponsive stacks', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ database: 'ok' }),
    })

    await checkStackHealth(stackUrl)

    const init = mockFetch.mock.calls[0]![1] as RequestInit
    expect(init.signal).toBeInstanceOf(AbortSignal)
  })
})
