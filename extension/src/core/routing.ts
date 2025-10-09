import { BrowserExtensionClient } from '../messaging'
import { Transport } from '../messaging/transports/transport'

interface SetupRoutesOptions {
  studio: Transport
  frontend: Transport
}

export function setupBackgroundRouting(options: SetupRoutesOptions) {
  const background = new BrowserExtensionClient('background')

  const frontend = new BrowserExtensionClient('frontend', options.frontend)

  const studio = new BrowserExtensionClient('studio', options.studio)

  background.forward('events-recorded', [studio, frontend])
  background.forward('events-loaded', [frontend])

  studio.forward('navigate', [background])
  studio.forward('highlight-elements', [frontend])

  frontend.forward('reload-extension', [background])
  frontend.forward('record-events', [background])
  frontend.forward('navigate', [background])
  frontend.forward('load-events', [background])
  frontend.forward('stop-recording', [studio])

  return background
}

export function setupFrontendRouting(backgroundTransport: Transport) {
  const frontend = new BrowserExtensionClient('frontend')

  const background = new BrowserExtensionClient('recorder', backgroundTransport)

  frontend.forward('record-events', [background])
  frontend.forward('navigate', [background])
  frontend.forward('load-events', [background])
  frontend.forward('stop-recording', [background])
  frontend.forward('reload-extension', [background])

  background.forward('events-recorded', [frontend])
  background.forward('events-loaded', [frontend])
  background.forward('highlight-elements', [frontend])

  return frontend
}
