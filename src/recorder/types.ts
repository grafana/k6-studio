export interface LaunchBrowserOptions {
  url?: string
  capture: {
    browser: boolean
  }
}

export type LaunchBrowserErrorReason =
  | 'websocket-server-error'
  | 'browser-launch'
  | 'recording-session'
  | 'unknown'
