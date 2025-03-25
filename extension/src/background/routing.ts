import { BrowserExtensionClient } from '../messaging'
import { BufferedTransport } from '../messaging/transports/buffered'
import { ContentScriptsTransport } from '../messaging/transports/contentScripts'
import { InMemoryTransport } from '../messaging/transports/inMemory'
import { NullTransport } from '../messaging/transports/null'
import { WebSocketTransport } from '../messaging/transports/webSocket'

const background = new BrowserExtensionClient(
  'background',
  new InMemoryTransport()
)

const frontend = new BrowserExtensionClient(
  'frontend',
  new ContentScriptsTransport()
)

const studio = new BrowserExtensionClient(
  'studio',
  STANDALONE_EXTENSION
    ? new NullTransport()
    : new BufferedTransport(new WebSocketTransport('ws://localhost:7554'))
)

background.forward('events-recorded', [studio, frontend])
background.forward('events-loaded', [frontend])

studio.forward('navigate', [background])
studio.forward('highlight-element', [frontend])

frontend.forward('record-events', [background])
frontend.forward('navigate', [background])
frontend.forward('load-events', [background])

export { background as client }
