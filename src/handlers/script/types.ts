import { K6TestOptions } from '@/utils/k6/schema'

export enum ScriptHandler {
  Select = 'script:select',
  Analyze = 'script:analyze',
  Run = 'script:run',
  Stop = 'script:stop',
  Log = 'script:log',
  Stopped = 'script:stopped',
  Finished = 'script:finished',
  Failed = 'script:failed',
  Check = 'script:check',
  RunFromGenerator = 'script:run-from-generator',
  BrowserAction = 'script:browser-action',
}

export interface ScriptAnalysis {
  isExternal: boolean
  options: K6TestOptions
}
