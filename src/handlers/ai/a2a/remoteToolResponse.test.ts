import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { A2ASessionConfig } from './config'
import { sendRemoteToolResponse } from './remoteToolResponse'

const config: A2ASessionConfig = {
  baseUrl: 'https://api.grafana.net/api/cli/v1/a2a',
  agentId: 'test-agent',
  bearerToken: 'test-token',
}

const payload = {
  requestId: 'req-1',
  chatId: 'chat-1',
  success: true as const,
  result: { output: 'test' },
}

describe('sendRemoteToolResponse', () => {
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('succeeds when server returns 200', async () => {
    mockFetch.mockResolvedValue({ ok: true })

    await expect(
      sendRemoteToolResponse(config, payload)
    ).resolves.toBeUndefined()
  })

  it('throws when server returns a non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Permission check failed'),
    })

    await expect(sendRemoteToolResponse(config, payload)).rejects.toThrow(
      'Failed to send remote tool response (500): Permission check failed'
    )
  })

  it('throws with fallback message when response body read fails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.reject(new Error('read error')),
    })

    await expect(sendRemoteToolResponse(config, payload)).rejects.toThrow(
      'Failed to send remote tool response (502): Unknown error'
    )
  })
})
