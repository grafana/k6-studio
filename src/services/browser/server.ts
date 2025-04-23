import { BrowserWindow } from 'electron'

import { BrowserExtensionClient } from 'extension/src/messaging'
import { Sender } from 'extension/src/messaging/transports/transport'
import { WebSocketServerTransport } from 'extension/src/messaging/transports/webSocketServer'
import { BrowserExtensionMessage } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

type BrowserExtensionServerEvents = {
  'stop-recording': {
    sender?: Sender
    data: Extract<BrowserExtensionMessage, { type: 'stop-recording' }>
  }
}

export class BrowserServer extends EventEmitter<BrowserExtensionServerEvents> {
  #client: BrowserExtensionClient | null = null

  start(browserWindow: BrowserWindow) {
    this.#client = new BrowserExtensionClient(
      'studio-server',
      new WebSocketServerTransport('localhost', 7554)
    )

    this.#client.on('events-recorded', (event) => {
      browserWindow.webContents.send('browser:event', event.data.events)
    })

    this.#client.on('stop-recording', (event) => {
      this.emit('stop-recording', event)
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
