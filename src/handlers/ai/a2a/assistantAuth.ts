import { app, ipcMain, shell } from 'electron'
import log from 'electron-log/main'

import { getProfileData } from '@/handlers/auth/fs'
import {
  buildAssistantAuthUrl,
  exchangeAssistantCode,
  generatePKCE,
  generateState,
  startCallbackServer,
} from '@/services/grafana/assistantAuth'

import { AssistantAuthHandler } from '../types'

import {
  clearAssistantTokens,
  hasAssistantTokens,
  saveAssistantTokens,
} from './tokenStore'

const PREFIX = '[GrafanaAssistant]'

export type AssistantAuthResult =
  | { type: 'authenticated' }
  | { type: 'error'; error: string }
  | { type: 'aborted' }

export interface AssistantAuthStatus {
  authenticated: boolean
  stackId: string | null
  stackName: string | null
}

let pendingAbortController: AbortController | null = null

async function performSignIn(
  stackId: string,
  stackUrl: string
): Promise<AssistantAuthResult> {
  const abortController = new AbortController()
  pendingAbortController = abortController

  try {
    const { codeVerifier, codeChallenge } = generatePKCE()
    const state = generateState()

    const { port, waitForCallback } = await startCallbackServer(
      abortController.signal
    )

    const authUrl = buildAssistantAuthUrl(stackUrl, codeChallenge, state, port)

    log.info(
      PREFIX,
      'Initiating assistant auth for stack',
      stackId,
      'on port',
      port
    )
    void shell.openExternal(authUrl)

    const callback = await waitForCallback()
    app.focus({ steal: true })

    if (callback.state !== state) {
      log.error(PREFIX, 'State mismatch in assistant auth callback')
      return {
        type: 'error',
        error: 'State mismatch — possible CSRF attack. Please try again.',
      }
    }

    if (!callback.endpoint) {
      return {
        type: 'error',
        error: 'No API endpoint received from auth callback.',
      }
    }

    const tokenResponse = await exchangeAssistantCode(
      callback.endpoint,
      callback.code,
      codeVerifier
    )

    await saveAssistantTokens(stackId, {
      accessToken: tokenResponse.token,
      refreshToken: tokenResponse.refresh_token,
      apiEndpoint: tokenResponse.api_endpoint,
      expiresAt: new Date(tokenResponse.expires_at).getTime(),
      refreshExpiresAt: new Date(tokenResponse.refresh_expires_at).getTime(),
    })

    log.info(PREFIX, 'Assistant auth completed for stack', stackId)
    return { type: 'authenticated' }
  } catch (error) {
    if (abortController.signal.aborted) {
      return { type: 'aborted' }
    }

    log.error(PREFIX, 'Assistant auth failed:', error)
    return {
      type: 'error',
      error: error instanceof Error ? error.message : 'Authentication failed',
    }
  } finally {
    if (pendingAbortController === abortController) {
      pendingAbortController = null
    }
  }
}

export function initialize() {
  ipcMain.handle(
    AssistantAuthHandler.SignIn,
    async (): Promise<AssistantAuthResult> => {
      const profile = await getProfileData()
      const stackId = profile.profiles.currentStack

      if (!stackId) {
        return { type: 'error', error: 'No Grafana Cloud stack selected.' }
      }

      const stack = profile.profiles.stacks[stackId]

      if (!stack) {
        return { type: 'error', error: 'Current stack not found in profile.' }
      }

      if (pendingAbortController) {
        pendingAbortController.abort()
      }

      return performSignIn(stackId, stack.url)
    }
  )

  ipcMain.handle(
    AssistantAuthHandler.GetStatus,
    async (): Promise<AssistantAuthStatus> => {
      const profile = await getProfileData()
      const stackId = profile.profiles.currentStack

      if (!stackId) {
        return { authenticated: false, stackId: null, stackName: null }
      }

      const stack = profile.profiles.stacks[stackId]
      const authenticated = await hasAssistantTokens(stackId)

      return {
        authenticated,
        stackId,
        stackName: stack?.name ?? null,
      }
    }
  )

  ipcMain.handle(AssistantAuthHandler.CancelSignIn, () => {
    if (pendingAbortController) {
      pendingAbortController.abort()
      pendingAbortController = null
    }
  })

  ipcMain.handle(AssistantAuthHandler.SignOut, async (): Promise<void> => {
    const profile = await getProfileData()
    const stackId = profile.profiles.currentStack

    if (stackId) {
      await clearAssistantTokens(stackId)
      log.info(PREFIX, 'Cleared assistant tokens for stack', stackId)
    }
  })
}
