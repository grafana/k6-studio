import { BrowserExtensionClient } from '../messaging/client'
import { BackgroundTransport } from '../messaging/transports/background'
import { InMemoryTransport } from '../messaging/transports/inMemory'

const background = new BrowserExtensionClient(
  'recorder',
  new BackgroundTransport('recorder')
)
const client = new BrowserExtensionClient('frontend', new InMemoryTransport())

client.forward('record-events', [background])
client.forward('navigate', [background])
client.forward('load-events', [background])

background.forward('events-recorded', [client])
background.forward('events-loaded', [client])

export { client }
