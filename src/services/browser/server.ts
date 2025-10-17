import { BrowserWindow } from 'electron'

import { BrowserHandler } from '@/handlers/browser/types'
import {
  browserToStudioEvents,
  browserToStudioMethods,
} from 'extension/src/core/clients/browserToStudio'
import { serve } from 'extension/src/core/clients/messaging/server'
import { WebSocketServerTransport } from 'extension/src/core/clients/messaging/transports/webSocketServer'
import { StudioToBrowserClient } from 'extension/src/core/clients/studioToBrowser'
import { EventEmitter } from 'extension/src/utils/events'

type BrowserExtensionServerEvents = {
  'stop-recording': {
    sender?: string
    data: { type: 'stop-recording' }
  }
}

export class BrowserServer extends EventEmitter<BrowserExtensionServerEvents> {
  #transport: WebSocketServerTransport | null = null
  #server: Disposable | null = null

  #client: StudioToBrowserClient | null = null

  get client() {
    return this.#client
  }

  async start(browserWindow: BrowserWindow) {
    this.#transport = await WebSocketServerTransport.create('localhost', 7554)

    this.#client = new StudioToBrowserClient(this.#transport)

    this.#server = serve({
      transport: this.#transport,
      methods: browserToStudioMethods,
      events: browserToStudioEvents,
      handlers: {
        stopRecording: () => {
          this.emit('stop-recording', {
            data: {
              type: 'stop-recording',
            },
          })
        },

        recordEvents: (events) => {
          browserWindow.webContents.send(BrowserHandler.BrowserEvent, events)
        },
      },
    })
  }

  stop() {
    this.#transport?.[Symbol.dispose]()
    this.#transport = null

    this.#server?.[Symbol.dispose]()
    this.#server = null

    this.#client = null
  }
}
