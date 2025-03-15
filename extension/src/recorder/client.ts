import { BrowserExtensionClient } from '../messaging/client'
import { BackgroundTransport } from '../messaging/transports/background'

export const background = new BrowserExtensionClient(
  'recorder',
  new BackgroundTransport('recorder')
)
