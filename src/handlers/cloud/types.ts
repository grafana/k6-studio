export enum CloudHandlers {
  Run = 'cloud:run',
  SignedIn = 'cloud:signed-in',
  StateChange = 'cloud:state-change',
  EstimateVuh = 'cloud:estimate-vuh',
}

export interface VuhEstimate {
  /** VU-hours the cloud will bill (volume reduction already applied). */
  vuhUsage: number
  /** Raw VU-hours before the volume reduction, when the cloud reports it. */
  baseVuh: number | null
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
