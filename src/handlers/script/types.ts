import { K6TestOptions } from '@/utils/k6/schema'

export enum ScriptHandler {
  Analyze = 'script:analyze',
  Select = 'script:select',
  Open = 'script:open',
  Run = 'script:run',
  Stop = 'script:stop',
  Save = 'script:save',
  Log = 'script:log',
  Started = 'script:started',
  Stopped = 'script:stopped',
  Finished = 'script:finished',
  Failed = 'script:failed',
  Check = 'script:check',
  BrowserAction = 'script:browser-action',
  BrowserReplay = 'script:browser-replay',
}

export interface OpenScriptResult {
  script: string
  isExternal: boolean
  options: K6TestOptions
}
