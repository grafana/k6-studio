import { Process } from '@puppeteer/browsers'
import { ChildProcessWithoutNullStreams } from 'child_process'
import eventEmitter from 'events'

import { defaultSettings } from './settings'
import { ProxyStatus } from './types'
import { AppSettings } from './types/settings'

export type k6StudioState = {
  currentBrowserProcess: Process | ChildProcessWithoutNullStreams | null
  proxyStatus: ProxyStatus
  proxyEmitter: eventEmitter
  appSettings: AppSettings
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
  }
}
