export enum ScriptHandler {
  Select = 'script:select',
  Run = 'script:run',
  Analyze = 'script:analyze',
  Stop = 'script:stop',
  Save = 'script:save',
  Log = 'script:log',
  Started = 'script:started',
  Stopped = 'script:stopped',
  Finished = 'script:finished',
  Failed = 'script:failed',
  Check = 'script:check',
  RunFromGenerator = 'script:run-from-generator',
  BrowserAction = 'script:browser-action',
  BrowserReplay = 'script:browser-replay',
}

export interface RunScriptOptions {
  path: string
  scenario?: string
  shouldTrack?: boolean
}

export interface RunScriptFromGeneratorOptions extends RunScriptOptions {
  content: string
}
