import { describe, expect, it, vi } from 'vitest'

vi.hoisted(() => {
  ;(globalThis as { __ENV?: Record<string, string> }).__ENV = {
    K6_TRACKING_SERVER_PORT: '1234',
  }
})

// The module graph is reset per test so the tracking url constant is
// re-evaluated; http has to be imported from the same graph to be spied on.
async function loadModules() {
  vi.resetModules()

  const http = (await import('k6/http')).default
  const { postTracking } = await import('./utils')

  return { asyncRequest: vi.spyOn(http, 'asyncRequest'), postTracking }
}

type Response = Awaited<ReturnType<typeof import('k6/http').asyncRequest>>

describe('postTracking', () => {
  it('resolves false when the request throws synchronously', async () => {
    const { asyncRequest, postTracking } = await loadModules()

    asyncRequest.mockImplementation(() => {
      throw new Error('cannot send in this state')
    })

    await expect(postTracking('/log', '{}')).resolves.toBe(false)
  })

  it('resolves false when the server rejects the body', async () => {
    const { asyncRequest, postTracking } = await loadModules()

    asyncRequest.mockResolvedValue({ status: 500 } as Response)

    await expect(postTracking('/log', '{}')).resolves.toBe(false)
  })

  it('resolves true when the server accepts the body', async () => {
    const { asyncRequest, postTracking } = await loadModules()

    asyncRequest.mockResolvedValue({ status: 204 } as Response)

    await expect(postTracking('/log', '{}')).resolves.toBe(true)
  })
})
