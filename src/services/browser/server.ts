import { BrowserEvent } from '@/schemas/recording'
import { BrowserExtensionClient } from 'extension/src/messaging'
import { WebSocketServerTransport } from 'extension/src/messaging/transports/webSocketServer'
import {
  BrowserExtensionMessage,
  InBrowserSettings,
} from 'extension/src/messaging/types'
import { EventEmitter } from 'extension/src/utils/events'

export interface RecordEvent {
  source: 'record-events' | 'events-recorded'
  events: BrowserEvent[]
}

type BrowserExtensionServerEvents = {
  load: EmptyObject
  stop: EmptyObject
  record: RecordEvent
  focus: { tab: string }
}

export class BrowserServer extends EventEmitter<BrowserExtensionServerEvents> {
  #client: BrowserExtensionClient

  #settings = new Map<string, InBrowserSettings>()

  static async start() {
    const transport = await WebSocketServerTransport.create('localhost', 7554)

    return new BrowserServer(
      new BrowserExtensionClient('studio-server', transport)
    )
  }

  constructor(client: BrowserExtensionClient) {
    super()

    this.#client = client

    this.#client.on('load-events', () => {
      this.emit('load', {})
    })

    this.#client.on('record-events', (event) => {
      this.emit('record', {
        source: 'record-events',
        events: event.data.events,
      })
    })

    this.#client.on('events-recorded', ({ data }) => {
      this.emit('record', {
        source: 'events-recorded',
        events: data.events,
      })
    })

    this.#client.on('stop-recording', () => {
      this.emit('stop', {})
    })

    this.#client.on('focus-tab', (event) => {
      this.emit('focus', { tab: event.data.tab })
    })

    this.#client.on('load-settings', ({ data }) => {
      const settings = this.#settings.get(data.tab)

      this.#client.send({
        type: 'sync-settings',
        settings: settings ?? null,
        tab: data.tab,
      })
    })

    this.#client.on('save-settings', ({ data }) => {
      this.#settings.set(data.tab, data.settings)

      this.#client.send({
        type: 'sync-settings',
        settings: data.settings,
        tab: data.tab,
      })
    })
  }

  send(message: BrowserExtensionMessage) {
    this.#client.send(message)
  }

  stop() {
    this.#client.dispose()
  }

  [Symbol.dispose]() {
    this.stop()
  }
}
