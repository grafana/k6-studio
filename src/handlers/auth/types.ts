import { StackInfo, UserProfiles } from '@/schemas/profile'

export enum AuthHandler {
  GetProfiles = 'auth:get-profiles',
  SignIn = 'auth:sign-in',
  SelectStack = 'auth:select-stack',
  RetryStack = 'auth:retry-stack',
  SignOut = 'auth:sign-out',
  StateChange = 'auth:state-change',
  Abort = 'auth:abort',
  ChangeStack = 'auth:change-stack',
}

export interface SignOutResponse {
  current: StackInfo | null
  profiles: UserProfiles
}

export interface ChangeStackResponse {
  current: StackInfo
  profiles: UserProfiles
}
