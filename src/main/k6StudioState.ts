import { FSWatcher } from 'chokidar'
import eventEmitter from 'events'

import { RecordingSession } from '@/recorder/launchers/types'

import { ProxyStatus } from '../types'
import { AppSettings } from '../types/settings'

import { type ProxyProcess } from './proxy'
import { defaultSettings } from './settings'

export type k6StudioState = {
  currentRecordingSession: RecordingSession | null
  proxyStatus: ProxyStatus
  proxyEmitter: eventEmitter
  appSettings: AppSettings
  currentProxyProcess: ProxyProcess | null
  wasProxyStoppedByClient: boolean
  proxyRetryCount: number
  appShuttingDown: boolean
  currentClientRoute: string
  wasAppClosedByClient: boolean
  watcher: FSWatcher | null
}

export function initialize() {
  globalThis.k6StudioState = {
    currentRecordingSession: null,
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
    watcher: null,
  }
}
