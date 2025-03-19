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

export interface ScriptFile {
  type: 'file'
  path: string
}

export interface RawScript {
  type: 'raw'
  name: string
  content: string
}

export type Script = ScriptFile | RawScript

export type RunInCloudResult = RunInCloudAborted | RunInCloudStarted
