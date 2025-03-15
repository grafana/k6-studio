import { BrowserWindow } from 'electron'
import { BrowserExtensionClient } from 'extension/src/messaging/client'
import { WebSocketServerTransport } from 'extension/src/messaging/transports/webSocketServer'
import { BrowserExtensionMessage } from 'extension/src/messaging/types'

export class BrowserServer {
  #client: BrowserExtensionClient | null = null

  start(browserWindow: BrowserWindow) {
    this.#client = new BrowserExtensionClient(
      'studio-server',
      new WebSocketServerTransport('localhost', 7554)
    )

    this.#client.on('events-recorded', (event) => {
      browserWindow.webContents.send('browser:event', event.data.events)
    })
  }

  send(message: BrowserExtensionMessage) {
    this.#client?.send(message)
  }

  stop() {
    this.#client?.dispose()
    this.#client = null
  }
}
