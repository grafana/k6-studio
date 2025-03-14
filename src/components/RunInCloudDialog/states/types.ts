export interface InitializingState {
  type: 'initializing'
}

export interface SignInState {
  type: 'sign-in'
}

export interface PreparingState {
  type: 'preparing'
}

export interface UploadingState {
  type: 'uploading'
}

export interface StartingState {
  type: 'starting'
}

export interface StartedState {
  type: 'started'
  testRunUrl: string
}

export interface ErrorState {
  type: 'error'
}

export type RunInCloudState =
  | InitializingState
  | SignInState
  | PreparingState
  | UploadingState
  | StartingState
  | StartedState
  | ErrorState
