export enum CloudHandlers {
  Run = 'cloud:run',
  SignedIn = 'cloud:signed-in',
  StateChange = 'cloud:state-change',
}

export interface RunInCloudResult {
  testRunUrl: string
}
