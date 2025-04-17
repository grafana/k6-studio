import { BrowserExtensionClient } from '../messaging'
import { BackgroundTransport } from '../messaging/transports/background'

const frontend = new BrowserExtensionClient('frontend')

const background = new BrowserExtensionClient(
  'recorder',
  new BackgroundTransport('recorder')
)

frontend.forward('record-events', [background])
frontend.forward('navigate', [background])
frontend.forward('load-events', [background])

background.forward('events-recorded', [frontend])
background.forward('events-loaded', [frontend])

export { frontend as client }
