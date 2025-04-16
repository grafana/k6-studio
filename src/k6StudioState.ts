import { Process } from '@puppeteer/browsers'
import { ChildProcessWithoutNullStreams } from 'child_process'
import eventEmitter from 'events'

import { type ProxyProcess } from './proxy'
import { defaultSettings } from './settings'
import { ProxyStatus } from './types'
import { AppSettings } from './types/settings'

export type k6StudioState = {
  currentBrowserProcess: Process | ChildProcessWithoutNullStreams | null
  proxyStatus: ProxyStatus
  proxyEmitter: eventEmitter
  appSettings: AppSettings
  currentProxyProcess: ProxyProcess | null
  wasProxyStoppedByClient: boolean
  proxyRetryCount: number
  appShuttingDown: boolean
}

export function initialize() {
  globalThis.k6StudioState = {
    currentBrowserProcess: null,
    proxyStatus: 'offline',
    proxyEmitter: new eventEmitter<{
      'status:change': [ProxyStatus]
      ready: [void]
    }>(),
    appSettings: defaultSettings,
    currentProxyProcess: null,
    wasProxyStoppedByClient: false,
    proxyRetryCount: 0,
    appShuttingDown: false,
  }
}
