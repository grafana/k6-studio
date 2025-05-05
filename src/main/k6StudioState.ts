import { Process } from '@puppeteer/browsers'
import { ChildProcessWithoutNullStreams } from 'child_process'
import { FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'
import eventEmitter from 'events'

import { ProxyStatus } from '../types'
import { AppSettings } from '../types/settings'

import { type ProxyProcess } from './proxy'
import { defaultSettings } from './settings'

export type k6StudioState = {
  currentBrowserProcess: Process | ChildProcessWithoutNullStreams | null
  proxyStatus: ProxyStatus
  proxyEmitter: eventEmitter
  appSettings: AppSettings
  currentProxyProcess: ProxyProcess | null
  wasProxyStoppedByClient: boolean
  proxyRetryCount: number
  appShuttingDown: boolean
  currentClientRoute: string
  wasAppClosedByClient: boolean
  splashscreenWindow: BrowserWindow | null
  watcher: FSWatcher | null
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

    // Used mainly to avoid starting a new proxy when closing the active one on shutdown
    appShuttingDown: false,
    // Used to track the current route in the client side
    currentClientRoute: '/',
    wasAppClosedByClient: false,

    splashscreenWindow: null,
    watcher: null,
  }
}
