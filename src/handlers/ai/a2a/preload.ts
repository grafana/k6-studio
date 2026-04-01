import { ipcRenderer } from 'electron'

import { AssistantAuthHandler } from '../types'

import type { AssistantAuthResult, AssistantAuthStatus } from './assistantAuth'

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
