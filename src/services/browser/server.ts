import { BrowserEvent } from '@/schemas/recording'
import { BrowserExtensionClient } from 'extension/src/messaging'
import { WebSocketServerTransport } from 'extension/src/messaging/transports/webSocketServer'
import { BrowserExtensionMessage } from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

export interface RecordEvent {
  events: BrowserEvent[]
}

type BrowserExtensionServerEvents = {
  stop: EmptyObject
  record: RecordEvent
}

export class BrowserServer extends EventEmitter<BrowserExtensionServerEvents> {
  #client: BrowserExtensionClient | null = null

  async start() {
    const transport = await WebSocketServerTransport.create('localhost', 7554)

    this.#client = new BrowserExtensionClient('studio-server', transport)

    this.#client.on('events-recorded', (event) => {
      this.emit('record', {
        events: event.data.events,
      })
    })

    this.#client.on('stop-recording', () => {
      this.emit('stop', {})
    })
  }

  send(message: BrowserExtensionMessage) {
    this.#client?.send(message)
  }

  stop() {
    this.#client?.dispose()
    this.#client = null
  }

  [Symbol.dispose]() {
    this.stop()
  }
}
