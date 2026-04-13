import { app, BrowserWindow, ipcMain, shell } from 'electron'
import log from 'electron-log/main'

import { getProfileData } from '@/handlers/auth/fs'
import { isEncryptionAvailable } from '@/main/encryption'
import {
  buildAssistantAuthUrl,
  exchangeAssistantCode,
  generatePKCE,
  generateState,
  startCallbackServer,
} from '@/services/grafana/assistantAuth'
import { browserWindowFromEvent } from '@/utils/electron'

import { AssistantAuthHandler } from '../types'

import { LOG_PREFIX } from './constants'
import { checkStackHealth, type StackHealthStatus } from './stackHealth'
import {
  clearAssistantTokens,
  hasAssistantTokens,
  mapTokenResponse,
  saveAssistantTokens,
} from './tokenStore'

export type AssistantAuthResult =
  | { type: 'authenticated' }
  | { type: 'error'; error: string }
  | { type: 'aborted' }

export interface AssistantAuthStatus {
  authenticated: boolean
  stackId: string | null
  stackName: string | null
}

function isAllowedEndpoint(endpoint: string, stackUrl: string): boolean {
  try {
    const endpointHost = new URL(endpoint).hostname
    const stackHost = new URL(stackUrl).hostname

    return (
      endpointHost === stackHost ||
      endpointHost.endsWith('.grafana.net') ||
      endpointHost.endsWith('.grafana-dev.net')
    )
  } catch {
    return false
  }
}

function verificationCode(codeChallenge: string): string {
  try {
    const hex = Buffer.from(codeChallenge, 'base64url')
      .subarray(0, 4)
      .toString('hex')
    return hex.slice(0, 4) + '-' + hex.slice(4)
  } catch {
    return '----'
  }
}

let pendingAbortController: AbortController | null = null

async function performSignIn(
  stackId: string,
  stackUrl: string,
  browserWindow: BrowserWindow
): Promise<AssistantAuthResult> {
  const abortController = new AbortController()
  pendingAbortController = abortController

  try {
    const { codeVerifier, codeChallenge } = generatePKCE()
    const state = generateState()

    const { port, result } = await startCallbackServer(abortController.signal)

    const authUrl = buildAssistantAuthUrl(stackUrl, codeChallenge, state, port)

    log.info(
      LOG_PREFIX,
      'Initiating assistant auth for stack',
      stackId,
      'on port',
      port
    )
    void shell.openExternal(authUrl)

    const code = verificationCode(codeChallenge)
    browserWindow.webContents.send(AssistantAuthHandler.VerificationCode, code)

    const callback = await result
    app.focus({ steal: true })

    if (callback.state !== state) {
      log.error(LOG_PREFIX, 'State mismatch in assistant auth callback')
      return {
        type: 'error',
        error: 'State mismatch, possible CSRF attack. Please try again.',
      }
    }

    if (!callback.endpoint) {
      return {
        type: 'error',
        error: 'No API endpoint received from auth callback.',
      }
    }

    if (!isAllowedEndpoint(callback.endpoint, stackUrl)) {
      log.error(
        LOG_PREFIX,
        'Callback endpoint does not match expected stack URL:',
        callback.endpoint
      )
      return {
        type: 'error',
        error: 'Unexpected API endpoint received from auth callback.',
      }
    }

    const tokenResponse = await exchangeAssistantCode(
      callback.endpoint,
      callback.code,
      codeVerifier,
      abortController.signal
    )

    if (abortController.signal.aborted) {
      return { type: 'aborted' }
    }

    const tokens = mapTokenResponse(tokenResponse, tokenResponse.api_endpoint)

    await saveAssistantTokens(stackId, tokens)

    log.info(LOG_PREFIX, 'Assistant auth completed for stack', stackId)
    return { type: 'authenticated' }
  } catch (error) {
    if (abortController.signal.aborted) {
      return { type: 'aborted' }
    }

    log.error(LOG_PREFIX, 'Assistant auth failed:', error)
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
    async (event): Promise<AssistantAuthResult> => {
      const browserWindow = browserWindowFromEvent(event)
      const profile = await getProfileData()
      const stackId = profile.profiles.currentStack

      if (!stackId) {
        return { type: 'error', error: 'No Grafana Cloud stack selected.' }
      }

      const stack = profile.profiles.stacks[stackId]

      if (!stack) {
        return { type: 'error', error: 'Current stack not found in profile.' }
      }

      if (!isEncryptionAvailable()) {
        return {
          type: 'error',
          error:
            'Encryption is not available on this system. Assistant authentication requires secure storage for tokens.',
        }
      }

      if (pendingAbortController) {
        pendingAbortController.abort()
      }

      return performSignIn(stackId, stack.url, browserWindow)
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

  ipcMain.handle(
    AssistantAuthHandler.CheckStackHealth,
    async (): Promise<StackHealthStatus> => {
      const profile = await getProfileData()
      const stackId = profile.profiles.currentStack

      if (!stackId) {
        return 'loading'
      }

      const stack = profile.profiles.stacks[stackId]

      if (!stack) {
        return 'loading'
      }

      return checkStackHealth(stack.url)
    }
  )

  ipcMain.handle(AssistantAuthHandler.SignOut, async (): Promise<void> => {
    const profile = await getProfileData()
    const stackId = profile.profiles.currentStack

    if (stackId) {
      await clearAssistantTokens(stackId)
      log.info(LOG_PREFIX, 'Cleared assistant tokens for stack', stackId)
    }
  })
}
