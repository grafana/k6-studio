import { BrowserToStudioClient } from '../core/clients/browserToStudio'
import { WebSocketTransport } from '../core/clients/messaging/transports/webSocket'
import { initializeFrontendRecorder } from '../core/frontend'
import { StorageBackend } from '../core/settings'

import { initializeView } from './view'

let settings: Record<string, unknown> = {}

const storage: StorageBackend = {
  get(defaults) {
    return Promise.resolve({
      ...defaults,
      ...settings,
    })
  },
  set(data) {
    settings = data

    return Promise.resolve()
  },
}

const client = new BrowserToStudioClient(
  new WebSocketTransport('ws://localhost:7554')
)

initializeFrontendRecorder(client)
initializeView(client, storage)
