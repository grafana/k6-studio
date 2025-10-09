import { initializeFrontendRecorder } from '../core/frontend'
import { setupFrontendRouting } from '../core/routing'
import { StorageBackend } from '../core/settings'
import { BufferedTransport } from '../messaging/transports/buffered'
import { WebSocketTransport } from '../messaging/transports/webSocket'

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

const client = setupFrontendRouting(
  new BufferedTransport(new WebSocketTransport('ws://localhost:7554'))
)

initializeFrontendRecorder(client)
initializeView(client, storage)
