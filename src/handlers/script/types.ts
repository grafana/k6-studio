import { K6TestOptions } from '@/utils/k6/schema'

export enum ScriptHandler {
  Select = 'script:select',
  Open = 'script:open',
  Run = 'script:run',
  Stop = 'script:stop',
  Save = 'script:save',
  Log = 'script:log',
  Stopped = 'script:stopped',
  Finished = 'script:finished',
  Failed = 'script:failed',
  Check = 'script:check',
  RunFromGenerator = 'script:run-from-generator',
  BrowserAction = 'script:browser-action',
}

export interface OpenScriptResult {
  script: string
  options: K6TestOptions
}
