import { captureMessage } from '@sentry/electron/main'
import type { z } from 'zod/v4'

import { BrowserExtensionClient } from '@/recorder/browser/messaging'
import { WebSocketServerTransport } from '@/recorder/browser/messaging/transports/webSocketServer'
import {
  BrowserExtensionMessage,
  InBrowserSettings,
} from '@/recorder/browser/messaging/types'
import { BrowserEvent } from '@/schemas/recording'
import { EventEmitter } from '@/utils/events'

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

/**
 * Reports messages the browser rejected as invalid. A page that breaks the
 * transport breaks every message it sends, e.g. a script polluting
 * Array.prototype with toJSON double-encodes the events we receive, so we only
 * report the first failure instead of flooding Sentry for the whole session.
 */
export function createInvalidMessageReporter() {
  let reported = false

  return (error: z.ZodError) => {
    if (reported) {
      return
    }

    reported = true

    captureMessage('Browser extension client received an invalid message', {
      level: 'warning',
      tags: { component: 'browser-extension-messaging' },
      extra: {
        // Only zod's issue metadata is safe to send. The message that failed
        // validation holds recorded user input, including passwords typed into
        // the page, so never attach the message or any part of it here.
        issues: error.issues.map((issue) => ({
          path: issue.path.map(String).join('.'),
          code: issue.code,
          message: issue.message,
        })),
      },
    })
  }
}

export class BrowserServer extends EventEmitter<BrowserExtensionServerEvents> {
  #client: BrowserExtensionClient

  #settings = new Map<string, InBrowserSettings>()

  static async start() {
    const transport = await WebSocketServerTransport.create('127.0.0.1', 7554)

    return new BrowserServer(
      new BrowserExtensionClient('studio-server', transport, {
        onInvalidMessage: createInvalidMessageReporter(),
      })
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
