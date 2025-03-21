import { ipcRenderer } from 'electron'

import { StackInfo, UserProfiles } from '@/schemas/profile'
import {
  SignInResult,
  SignInProcessState,
  SelectStackResponse,
} from '@/types/auth'

import { createListener } from '../utils'

import {
  AuthHandler as AuthHandler,
  ChangeStackResponse,
  SignOutResponse,
} from './types'

export function getProfiles() {
  return ipcRenderer.invoke(AuthHandler.GetProfiles) as Promise<UserProfiles>
}

export function signIn(): Promise<SignInResult> {
  return ipcRenderer.invoke(AuthHandler.SignIn) as Promise<SignInResult>
}

export function retryStack() {
  return ipcRenderer.send(AuthHandler.RetryStack, {
    type: 'retry',
  })
}

export function selectStack(response: SelectStackResponse) {
  return ipcRenderer.send(AuthHandler.SelectStack, response)
}

export function abortSignIn() {
  return ipcRenderer.invoke(AuthHandler.Abort) as Promise<void>
}

export function signOut(stack: StackInfo) {
  return ipcRenderer.invoke(
    AuthHandler.SignOut,
    stack
  ) as Promise<SignOutResponse>
}

export function changeStack(stackId: string) {
  return ipcRenderer.invoke(
    AuthHandler.ChangeStack,
    stackId
  ) as Promise<ChangeStackResponse>
}

export function onStateChange(
  callback: (newState: SignInProcessState) => void
) {
  return createListener(AuthHandler.StateChange, callback)
}
