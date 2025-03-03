import {
  SignInResult,
  SignInProcessState,
  SelectStackResponse,
} from '@/types/auth'
import { ipcRenderer } from 'electron'
import { createListener } from '../utils'
import {
  AuthHandler as AuthHandler,
  ChangeStackResponse,
  SignOutResponse,
} from './types'
import { StackInfo, UserProfiles } from '@/schemas/profile'

export function getProfiles() {
  return ipcRenderer.invoke(AuthHandler.GetProfiles) as Promise<UserProfiles>
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

export function signOut(stack: StackInfo) {
  return ipcRenderer.invoke('auth:sign-out', stack) as Promise<SignOutResponse>
}

export function changeStack(stackId: string) {
  return ipcRenderer.invoke(
    'auth:change-stack',
    stackId
  ) as Promise<ChangeStackResponse>
}

export function onStateChange(
  callback: (newState: SignInProcessState) => void
) {
  return createListener('auth:state-change', callback)
}
