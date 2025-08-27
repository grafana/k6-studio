export enum BrowserHandler {
  Start = 'browser:start',
  Stop = 'browser:stop',
  Closed = 'browser:closed',
  Failed = 'browser:failed',
  OpenExternalLink = 'browser:open:external:link',
  BrowserEvent = 'browser:event',
}

export interface LaunchBrowserOptions {
  url?: string
  capture: {
    browser: boolean
  }
}

export type LaunchBrowserFailedReason =
  | 'websocket-server-error'
  | 'browser-launch'
