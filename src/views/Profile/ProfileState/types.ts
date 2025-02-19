import { UserInfo } from '@/schemas/profile'
import { SignInProcessState } from '@/types/auth'

export interface LoadingState {
  type: 'loading'
}

export interface SignedOutState {
  type: 'signed-out'
}

export interface SignedInState {
  type: 'signed-in'
  user: UserInfo
}

export interface SigningInState {
  type: 'signing-in'
  state: SignInProcessState
}

export interface ConfirmSignOutState {
  type: 'confirm-sign-out'
  user: UserInfo
}

export type SignInState =
  | LoadingState
  | SignedOutState
  | SignedInState
  | SigningInState
  | ConfirmSignOutState
