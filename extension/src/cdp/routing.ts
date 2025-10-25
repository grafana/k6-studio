import { BrowserExtensionClient } from '../messaging'
import { BufferedTransport } from '../messaging/transports/buffered'
import { WebSocketTransport } from '../messaging/transports/webSocket'

const frontend = new BrowserExtensionClient('frontend')

const studio = new BrowserExtensionClient(
  'recorder',
  new BufferedTransport(new WebSocketTransport('ws://localhost:7554'))
)

frontend.forward('record-events', [studio])
frontend.forward('navigate', [studio])
frontend.forward('load-events', [studio])
frontend.forward('stop-recording', [studio])
frontend.forward('reload-extension', [studio])
frontend.forward('focus-tab', [studio])

studio.forward('events-recorded', [frontend])
studio.forward('events-loaded', [frontend])
studio.forward('highlight-elements', [frontend])

export { frontend as client }
