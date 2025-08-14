import { BrowserExtensionClient } from '../messaging'
import { BufferedTransport } from '../messaging/transports/buffered'
import { PortTransport } from '../messaging/transports/port'
import { WebSocketTransport } from '../messaging/transports/webSocket'

const background = new BrowserExtensionClient('background')

const frontend = new BrowserExtensionClient('frontend', new PortTransport())

const studio = new BrowserExtensionClient(
  'studio',
  new BufferedTransport(new WebSocketTransport('ws://localhost:7554'))
)

background.forward('events-recorded', [studio, frontend])
background.forward('events-loaded', [frontend])

studio.forward('navigate', [background])
studio.forward('highlight-elements', [frontend])

frontend.forward('reload-extension', [background])
frontend.forward('record-events', [background])
frontend.forward('navigate', [background])
frontend.forward('load-events', [background])
frontend.forward('stop-recording', [studio])

export { background as client }
