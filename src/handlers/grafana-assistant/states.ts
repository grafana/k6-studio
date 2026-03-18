import { shell } from 'electron'
import { EventEmitter } from 'node:events'

import {
  buildAuthUrl,
  exchangeCodeForTokens,
} from '@/services/grafana-assistant/auth'
import { startCallbackServer } from '@/services/grafana-assistant/callback-server'
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateState,
} from '@/services/grafana-assistant/pkce'
import { exhaustive } from '@/utils/typescript'

import { saveConnection } from './storage'
import {
  ConnectProcessState,
  ConnectResult,
  GrafanaAssistantConnection,
} from './types'

interface AuthorizingState {
  type: 'authorizing'
  grafanaUrl: string
}

interface ExchangingState {
  type: 'exchanging'
  grafanaUrl: string
  endpoint: string
  code: string
  codeVerifier: string
}

interface CompletedState {
  type: 'completed'
  result: ConnectResult
}

type State = AuthorizingState | ExchangingState | CompletedState

type StateEventMap = {
  'state-change': [ConnectProcessState]
}

function wasAborted(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export class ConnectStateMachine extends EventEmitter<StateEventMap> {
  #controller: AbortController
  #signal: AbortSignal
  #grafanaUrl: string

  constructor(grafanaUrl: string) {
    super()
    this.#grafanaUrl = grafanaUrl
    this.#controller = new AbortController()
    this.#signal = this.#controller.signal
  }

  async start(): Promise<ConnectResult> {
    try {
      return await this.#loop()
    } catch (error) {
      if (wasAborted(error)) {
        return { type: 'aborted' }
      }
      const message = error instanceof Error ? error.message : 'Unknown error'
      return { type: 'error', message }
    }
  }

  abort() {
    this.#controller.abort()
  }

  async #loop(): Promise<ConnectResult> {
    let state: State = { type: 'authorizing', grafanaUrl: this.#grafanaUrl }

    while (!this.#signal.aborted) {
      state = await this.#execute(state)

      if (state.type === 'completed') {
        return state.result
      }
    }

    return { type: 'aborted' }
  }

  #execute(state: State): Promise<State> {
    switch (state.type) {
      case 'authorizing':
        return this.#authorize(state)
      case 'exchanging':
        return this.#exchange(state)
      case 'completed':
        return Promise.resolve(state)
      default:
        return exhaustive(state)
    }
  }

  async #authorize(state: AuthorizingState): Promise<State> {
    this.emit('state-change', { type: 'authorizing' })

    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)
    const csrfState = generateState()

    const { port, result } = await startCallbackServer(csrfState, this.#signal)

    const authUrl = buildAuthUrl(
      state.grafanaUrl,
      port,
      csrfState,
      codeChallenge
    )
    await shell.openExternal(authUrl)

    const { code, endpoint } = await result

    return {
      type: 'exchanging',
      grafanaUrl: state.grafanaUrl,
      endpoint,
      code,
      codeVerifier,
    }
  }

  async #exchange(state: ExchangingState): Promise<State> {
    this.emit('state-change', { type: 'exchanging' })

    const tokens = await exchangeCodeForTokens(
      state.endpoint,
      state.code,
      state.codeVerifier,
      this.#signal
    )

    await saveConnection(state.grafanaUrl, tokens)

    const connection: GrafanaAssistantConnection = {
      grafanaUrl: state.grafanaUrl,
      apiEndpoint: tokens.apiEndpoint,
      expiresAt: tokens.expiresAt,
    }

    this.emit('state-change', { type: 'completed', connection })

    return {
      type: 'completed',
      result: { type: 'connected', connection },
    }
  }
}
