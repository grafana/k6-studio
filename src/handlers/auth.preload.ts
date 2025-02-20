import { UserInfo } from '@/schemas/profile'
import {
  SignInResult,
  SignInProcessState,
  SelectStackResponse,
} from '@/types/auth'
import { ipcRenderer } from 'electron'
import { createListener } from './utils'
import { AuthHandler as AuthHandler } from './auth.types'

export function getUser() {
  return ipcRenderer.invoke(AuthHandler.GetUser) as Promise<UserInfo | null>
}

export function signIn(): Promise<SignInResult> {
  return ipcRenderer.invoke(AuthHandler.SignIn) as Promise<SignInResult>
}

export function selectStack(response: SelectStackResponse) {
  return ipcRenderer.send('auth:select-stack', response)
}

export function abortSignIn() {
  return ipcRenderer.invoke('auth:abort') as Promise<void>
}

export function signOut(): Promise<void> {
  return ipcRenderer.invoke('auth:sign-out') as Promise<void>
}

export function changeStack(stackId: string) {
  return ipcRenderer.invoke('auth:change-stack', stackId) as Promise<UserInfo>
}

export function onStateChange(
  callback: (newState: SignInProcessState) => void
) {
  return createListener('auth:state-change', callback)
}
