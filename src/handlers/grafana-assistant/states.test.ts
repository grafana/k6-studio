/* eslint-disable @typescript-eslint/unbound-method */
import { shell } from 'electron'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { exchangeCodeForTokens } from '@/services/grafana-assistant/auth'
import { startCallbackServer } from '@/services/grafana-assistant/callback-server'

import { ConnectStateMachine } from './states'
import { saveConnection } from './storage'
import type { ConnectProcessState } from './types'

vi.mock('electron', () => ({
  shell: {
    openExternal: vi.fn().mockResolvedValue(undefined),
  },
}))

vi.mock('@/services/grafana-assistant/pkce', () => ({
  generateCodeVerifier: vi.fn(() => 'mock-verifier'),
  generateCodeChallenge: vi.fn(() => 'mock-challenge'),
  generateState: vi.fn(() => 'mock-csrf-state'),
}))

vi.mock('@/services/grafana-assistant/callback-server', () => ({
  startCallbackServer: vi.fn(),
}))

vi.mock('@/services/grafana-assistant/auth', () => ({
  buildAuthUrl: vi.fn(
    () => 'https://grafana.example.com/a/grafana-assistant-app/cli/auth?...'
  ),
  exchangeCodeForTokens: vi.fn(),
}))

vi.mock('./storage', () => ({
  saveConnection: vi.fn().mockResolvedValue(undefined),
}))

const mockedOpenExternal = vi.mocked(shell.openExternal)
const mockedStartCallbackServer = vi.mocked(startCallbackServer)
const mockedExchangeCodeForTokens = vi.mocked(exchangeCodeForTokens)
const mockedSaveConnection = vi.mocked(saveConnection)

const mockCallbackParams = {
  code: 'auth-code-123',
  state: 'mock-csrf-state',
  endpoint: 'https://grafana.example.com',
}

const mockTokens = {
  gatToken: 'gat-token',
  garToken: 'gar-token',
  apiEndpoint: 'https://api.example.com',
  expiresAt: '2026-12-31T00:00:00Z',
  refreshExpiresAt: '2027-12-31T00:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedStartCallbackServer.mockResolvedValue({
    port: 54321,
    result: Promise.resolve(mockCallbackParams),
  })
  mockedExchangeCodeForTokens.mockResolvedValue(mockTokens)
})

describe('ConnectStateMachine', () => {
  describe('start()', () => {
    it('returns a connected result on success', async () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')

      const result = await machine.start()

      expect(result).toEqual({
        type: 'connected',
        connection: {
          grafanaUrl: 'https://grafana.example.com',
          apiEndpoint: mockTokens.apiEndpoint,
          expiresAt: mockTokens.expiresAt,
        },
      })
    })

    it('opens the auth URL in the browser', async () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')

      await machine.start()

      expect(mockedOpenExternal).toHaveBeenCalledWith(
        expect.stringContaining('grafana-assistant-app/cli/auth')
      )
    })

    it('saves the connection after a successful exchange', async () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')

      await machine.start()

      expect(mockedSaveConnection).toHaveBeenCalledWith(
        'https://grafana.example.com',
        mockTokens
      )
    })

    it('emits state-change events in order', async () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')
      const states: ConnectProcessState[] = []
      machine.on('state-change', (s) => states.push(s))

      await machine.start()

      expect(states[0]).toEqual({ type: 'authorizing' })
      expect(states[1]).toEqual({ type: 'exchanging' })
      expect(states[2]).toMatchObject({ type: 'completed' })
    })

    it('emits completed state with connection info', async () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')
      const states: ConnectProcessState[] = []
      machine.on('state-change', (s) => states.push(s))

      await machine.start()

      const completed = states.find((s) => s.type === 'completed')
      expect(completed).toEqual({
        type: 'completed',
        connection: {
          grafanaUrl: 'https://grafana.example.com',
          apiEndpoint: mockTokens.apiEndpoint,
          expiresAt: mockTokens.expiresAt,
        },
      })
    })

    it('returns an error result when token exchange fails', async () => {
      mockedExchangeCodeForTokens.mockRejectedValueOnce(
        new Error('Exchange failed')
      )

      const machine = new ConnectStateMachine('https://grafana.example.com')
      const result = await machine.start()

      expect(result).toEqual({ type: 'error', message: 'Exchange failed' })
    })

    it('returns an error result when callback server fails', async () => {
      mockedStartCallbackServer.mockRejectedValueOnce(
        new Error('No ports available')
      )

      const machine = new ConnectStateMachine('https://grafana.example.com')
      const result = await machine.start()

      expect(result).toEqual({
        type: 'error',
        message: 'No ports available',
      })
    })

    it('returns error with "Unknown error" for non-Error throws', async () => {
      mockedStartCallbackServer.mockRejectedValueOnce('a string error')

      const machine = new ConnectStateMachine('https://grafana.example.com')
      const result = await machine.start()

      expect(result).toEqual({ type: 'error', message: 'Unknown error' })
    })
  })

  describe('abort()', () => {
    it('returns an aborted result when aborted before starting', async () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')

      // Set up callback server to hang until aborted
      mockedStartCallbackServer.mockImplementationOnce(
        (_state, signal) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener('abort', () => {
              const err = new Error('Aborted')
              err.name = 'AbortError'
              reject(err)
            })
          })
      )

      const resultPromise = machine.start()
      machine.abort()
      const result = await resultPromise

      expect(result).toEqual({ type: 'aborted' })
    })

    it('can be called multiple times without error', () => {
      const machine = new ConnectStateMachine('https://grafana.example.com')
      expect(() => {
        machine.abort()
        machine.abort()
      }).not.toThrow()
    })
  })
})
