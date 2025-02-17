interface Stack {
  id: string
  name: string
}

interface InitializingState {
  type: 'initializing'
}

interface AwaitingAuthorizationState {
  type: 'awaiting-authorization'
  code: string
}

interface FetchingStacksState {
  type: 'fetching-stacks'
}

interface SelectingStackState {
  type: 'selecting-stack'
  stacks: Stack[]
}

interface FetchingTokenState {
  type: 'fetching-token'
  stack: string
}

export type SignInProcessState =
  | InitializingState
  | AwaitingAuthorizationState
  | FetchingStacksState
  | SelectingStackState
  | FetchingTokenState
