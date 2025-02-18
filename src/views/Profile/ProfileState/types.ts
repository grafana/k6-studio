import { CloudProfile } from '@/schemas/profile'
import { SignInProcessState } from '@/types/auth'

export interface LoadingState {
  type: 'loading'
}

export interface SignedOutState {
  type: 'signed-out'
}

export interface SignedInState {
  type: 'signed-in'
  profile: CloudProfile
}

export interface SigningInState {
  type: 'signing-in'
  state: SignInProcessState
}

export type SignInState =
  | LoadingState
  | SignedOutState
  | SignedInState
  | SigningInState
