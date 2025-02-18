import { UserInfo } from '@/schemas/profile'

export interface Stack {
  id: string
  name: string
  url: string
  archived: boolean
}

export interface InitializingState {
  type: 'initializing'
}

export interface AwaitingAuthorizationState {
  type: 'awaiting-authorization'
  code: string
}

export interface AuthorizationDeniedState {
  type: 'authorization-denied'
}

export interface SignOutRequiredState {
  type: 'sign-out-required'
}

export interface FetchingStacksState {
  type: 'fetching-stacks'
}

export interface SelectingStackState {
  type: 'selecting-stack'
  stacks: Stack[]
}

export interface FetchingTokenState {
  type: 'fetching-token'
  stack: Stack
}

export interface StackLoginRequiredState {
  type: 'stack-login-required'
  stack: Stack
}

export interface TimedOutState {
  type: 'timed-out'
}

export interface UnexpectedErrorState {
  type: 'unexpected-error'
}

export type SignInProcessState =
  | InitializingState
  | AwaitingAuthorizationState
  | AuthorizationDeniedState
  | SignOutRequiredState
  | FetchingStacksState
  | SelectingStackState
  | FetchingTokenState
  | StackLoginRequiredState
  | TimedOutState
  | UnexpectedErrorState

export interface Authenticated {
  type: 'authenticated'
  user: UserInfo
}

export interface Denied {
  type: 'denied'
}

export interface Conflict {
  type: 'conflict'
}

export interface TimedOut {
  type: 'timed-out'
}

export interface Aborted {
  type: 'aborted'
}

export type SignInResult =
  | Authenticated
  | Denied
  | Conflict
  | TimedOut
  | Aborted
