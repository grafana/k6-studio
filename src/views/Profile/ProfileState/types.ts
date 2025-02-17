export interface LoadingState {
  type: 'loading'
}

export interface SignedOutState {
  type: 'signed-out'
}

export interface SignedInState {
  type: 'signed-in'
  user: {
    name: string
    email: string
  }
}

export interface SigningInState {
  type: 'signing-in'
}

export type SignInState =
  | LoadingState
  | SignedOutState
  | SignedInState
  | SigningInState
