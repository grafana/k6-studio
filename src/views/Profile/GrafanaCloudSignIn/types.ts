export interface Stack {
  id: string
  name: string
  host: string
  archived: boolean
}

export interface InitializingState {
  type: 'initializing'
}

export interface AwaitingAuthorizationState {
  type: 'awaiting-authorization'
  code: string
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

export type SignInProcessState =
  | InitializingState
  | AwaitingAuthorizationState
  | FetchingStacksState
  | SelectingStackState
  | FetchingTokenState
  | StackLoginRequiredState
  | TimedOutState
