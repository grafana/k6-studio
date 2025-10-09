import { storage } from 'webextension-polyfill'

import { initializeFrontendRecorder } from '../core/frontend'
import { setupFrontendRouting } from '../core/routing'
import { StorageBackend } from '../core/settings'
import { BackgroundTransport } from '../messaging/transports/background'

import { initializeView } from './view'

const client = setupFrontendRouting(new BackgroundTransport('recorder'))

const extensionStorage: StorageBackend = {
  get(defaults: Record<string, unknown>) {
    return storage.local.get(defaults)
  },
  set(data) {
    return storage.local.set(data)
  },
}

initializeFrontendRecorder(client)
initializeView(client, extensionStorage)
