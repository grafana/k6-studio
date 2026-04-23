import type { LaunchBrowserErrorReason } from '@/recorder/types'

export enum BrowserHandler {
  Start = 'browser:start',
  Stop = 'browser:stop',
  Closed = 'browser:closed',
  Error = 'browser:error',
  OpenExternalLink = 'browser:open:external:link',
  BrowserEvent = 'browser:event',
}

export interface LaunchBrowserError {
  fatal: boolean
  reason: LaunchBrowserErrorReason
}
