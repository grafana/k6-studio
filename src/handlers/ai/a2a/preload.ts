import { ipcRenderer } from 'electron'

import { createListener } from '../../utils'
import { AssistantAuthHandler } from '../types'

import type { AssistantAuthResult, AssistantAuthStatus } from './assistantAuth'

export function onAssistantVerificationCode(callback: (code: string) => void) {
  return createListener(AssistantAuthHandler.VerificationCode, callback)
}

export function assistantSignIn() {
  return ipcRenderer.invoke(
    AssistantAuthHandler.SignIn
  ) as Promise<AssistantAuthResult>
}

export function assistantCancelSignIn() {
  return ipcRenderer.invoke(AssistantAuthHandler.CancelSignIn) as Promise<void>
}

export function assistantGetStatus() {
  return ipcRenderer.invoke(
    AssistantAuthHandler.GetStatus
  ) as Promise<AssistantAuthStatus>
}

export function assistantSignOut() {
  return ipcRenderer.invoke(AssistantAuthHandler.SignOut) as Promise<void>
}
