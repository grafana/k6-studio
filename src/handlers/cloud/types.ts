export enum CloudHandlers {
  Run = 'cloud:run',
  SignedIn = 'cloud:signed-in',
  StateChange = 'cloud:state-change',
}

export interface RunInCloudAborted {
  type: 'aborted'
}

export interface RunInCloudStarted {
  type: 'started'
  testRunUrl: string
}

export type RunInCloudResult = RunInCloudAborted | RunInCloudStarted
