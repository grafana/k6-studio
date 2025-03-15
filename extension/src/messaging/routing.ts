import { BrowserExtensionClient } from './client'
import { BufferedTransport } from './transports/buffered'
import { ContentScriptsTransport } from './transports/contentScripts'
import { InMemoryTransport } from './transports/inMemory'
import { NullTransport } from './transports/null'
import { WebSocketTransport } from './transports/webSocket'

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

studio.forward('navigate', [background])
studio.forward('highlight-element', [frontend])

frontend.forward('record-events', [background])
frontend.forward('navigate', [background])

export { background, frontend, studio }
