import { Process } from '@puppeteer/browsers'
import { ChildProcessWithoutNullStreams } from 'child_process'
import eventEmitter from 'events'

import { ProxyStatus } from './types'

export type k6StudioState = {
  currentBrowserProcess: Process | ChildProcessWithoutNullStreams | null
  proxyStatus: ProxyStatus
  proxyEmitter: eventEmitter
}

export function initialize() {
  globalThis.k6StudioState = {
    currentBrowserProcess: null,
    proxyStatus: 'offline',
    proxyEmitter: new eventEmitter<{
      'status:change': [ProxyStatus]
      ready: [void]
    }>(),
  }
}
