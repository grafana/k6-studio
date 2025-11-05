export enum BrowserHandler {
  Start = 'browser:start',
  Stop = 'browser:stop',
  Closed = 'browser:closed',
  Error = 'browser:error',
  OpenExternalLink = 'browser:open:external:link',
  BrowserEvent = 'browser:event',
}

export interface LaunchBrowserOptions {
  url?: string
  capture: {
    browser: boolean
  }
}

export type LaunchBrowserErrorReason =
  | 'websocket-server-error'
  | 'extension-load'
  | 'browser-launch'
  | 'unknown'

export interface LaunchBrowserError {
  fatal: boolean
  reason: LaunchBrowserErrorReason
}
