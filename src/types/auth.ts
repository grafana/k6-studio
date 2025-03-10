import { StackInfo, UserProfiles } from '@/schemas/profile'

export interface Stack {
  id: string
  name: string
  url: string
  status: 'active' | 'paused' | 'archived' | 'restoring'
}

/**
 * Initial state of sign-in where the OAuth server is contacted to
 * get the user code.
 */
export interface InitializingState {
  type: 'initializing'
}

/**
 * The app is waiting for the user to complete authorization in the browser.
 */
export interface AwaitingAuthorizationState {
  type: 'awaiting-authorization'
  code: string
}

/**
 * The user denied the authorization request.
 */
export interface AuthorizationDeniedState {
  type: 'authorization-denied'
}

/**
 * Loading state where we're fetching the available stacks from the
 * GCOM API.
 */
export interface FetchingStacksState {
  type: 'fetching-stacks'
}

/**
 * State where we're waiting for the user to select a stack to sign-in to.
 */
export interface SelectingStackState {
  type: 'selecting-stack'
  current: Stack | null
  stacks: Stack[]
}

/**
 * Loading state where we're fetching the personal API token from the k6 API.
 */
export interface FetchingTokenState {
  type: 'fetching-token'
  stack: Stack
}

/**
 * Users are not synced until they sign-in to a stack. This state is entered
 * when the user needs to sign-in to a stack to continue.
 */
export interface StackLoginRequiredState {
  type: 'stack-login-required'
  stack: Stack
}

/**
 * A time out occurred while waiting for the user to sign-in.
 */
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
  | FetchingStacksState
  | SelectingStackState
  | FetchingTokenState
  | StackLoginRequiredState
  | TimedOutState
  | UnexpectedErrorState

export interface Authenticated {
  type: 'authenticated'
  current: StackInfo
  profiles: UserProfiles
}

export interface Denied {
  type: 'denied'
}

export interface TimedOut {
  type: 'timed-out'
}

export interface Aborted {
  type: 'aborted'
}

export type SignInResult = Authenticated | Denied | TimedOut | Aborted

export interface RefreshStacks {
  type: 'refresh-stacks'
  current: Stack | null
}

export interface StackSelected {
  type: 'select-stack'
  selected: Stack
}

export type SelectStackResponse = RefreshStacks | StackSelected

export interface RetryLoginResponse {
  type: 'retry' | 'abort'
}
