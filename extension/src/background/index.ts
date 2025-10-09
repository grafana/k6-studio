import { initializeBackgroundRecorder } from '../core/background'
import { setupBackgroundRouting } from '../core/routing'
import { BufferedTransport } from '../messaging/transports/buffered'
import { PortTransport } from '../messaging/transports/port'
import { WebSocketTransport } from '../messaging/transports/webSocket'

import { ExtensionNavigationListener } from './navigation'

const client = setupBackgroundRouting({
  frontend: new PortTransport(),
  studio: new BufferedTransport(new WebSocketTransport('ws://localhost:7554')),
})

initializeBackgroundRecorder({
  client: client,
  navigation: new ExtensionNavigationListener(),
})
