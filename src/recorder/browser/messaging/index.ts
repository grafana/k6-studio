import { z } from 'zod/v4'

import { EventEmitter } from '@/utils/events'

import { NullTransport } from './transports/null'
import { Sender, SenderSchema, Transport } from './transports/transport'
import { BrowserExtensionMessage, BrowserExtensionMessageSchema } from './types'

const PingMessageSchema = z.object({
  type: z.literal('ping'),
})

const PongMessageSchema = z.object({
  type: z.literal('pong'),
})

const MessageEnvelopeSchema = z.object({
  type: z.literal('message'),
  sender: SenderSchema.optional(),
  data: BrowserExtensionMessageSchema,
})

const BrowserExtensionClientMessageSchema = z.discriminatedUnion('type', [
  PingMessageSchema,
  PongMessageSchema,
  MessageEnvelopeSchema,
])

type PingMessage = z.infer<typeof PingMessageSchema>
type PongMessage = z.infer<typeof PongMessageSchema>
type MessageEnvelope = z.infer<typeof MessageEnvelopeSchema>

type BrowserExtensionClientEvents = {
  [K in BrowserExtensionMessage['type']]: {
    sender?: Sender
    data: Extract<BrowserExtensionMessage, { type: K }>
  }
}

export type BrowserExtensionEvent =
  BrowserExtensionClientEvents[keyof BrowserExtensionClientEvents]

export interface BrowserExtensionClientOptions {
  /**
   * Called when an incoming message fails validation, so that the owner of the
   * client can report it. Messages that don't validate are dropped, which costs
   * us recorded events, so we want to know when it happens.
   */
  onInvalidMessage?: (error: z.ZodError) => void
}

/**
 * A single interface to handle asynchronous communication between the different parts of the extension,
 * e.g. from content script to background script, from background script to k6 Studio, etc.
 *
 * It builds on a generic Transport type which is responsible for sending and receiving messages, so that
 * the client doesn't have to care whether it's a web socket, a message port, or something else.
 *
 * Messages can be routed to other clients by calling the forward method, which will send the message to
 * all the clients passed as an argument. That way a message sent by e.g. k6 Studio can find its way to
 * content scripts.
 */
export class BrowserExtensionClient extends EventEmitter<BrowserExtensionClientEvents> {
  #transport: Transport
  #keepAlive: Parameters<typeof clearInterval>[0] = undefined

  constructor(
    name: string,
    transport: Transport = new NullTransport(),
    options: BrowserExtensionClientOptions = {}
  ) {
    super()

    this.#transport = transport

    this.#transport.on('message', ({ sender, data }) => {
      const parsed = BrowserExtensionClientMessageSchema.safeParse(data)

      if (!parsed.success) {
        // Never log the message itself: it can carry recorded user input,
        // including passwords, and in the main process console output becomes
        // a Sentry breadcrumb on the event onInvalidMessage reports.
        console.error(`[${name}] received invalid message:`, parsed.error)

        options.onInvalidMessage?.(parsed.error)

        return
      }

      const message = parsed.data

      switch (message.type) {
        case 'pong':
          break

        case 'ping':
          this.#transport.send({
            type: 'pong',
          } satisfies PongMessage)
          break

        case 'message':
          this.emit(message.data.type, {
            sender: message.sender ?? sender,
            data: message.data,
          } as BrowserExtensionEvent)
      }
    })

    this.#keepAlive = setInterval(() => {
      this.#transport.send({
        type: 'ping',
      } satisfies PingMessage)
    }, 5000)
  }

  /**
   * Sends a message over the configured transport. This will trigger event listeners
   * both on this instance and on the remote end.
   */
  send(message: BrowserExtensionMessage, sender?: Sender) {
    this.emit(message.type, {
      sender,
      data: message,
    } as BrowserExtensionEvent)

    this.#transport.send({
      type: 'message',
      sender,
      data: message,
    } satisfies MessageEnvelope)
  }

  /**
   * Forwards message of the given type to all of the clients passed as an argument.
   * This lets us route messages from e.g. k6 Studio via the background script to
   * content scripts with minimal configuration.
   */
  forward(
    type: BrowserExtensionMessage['type'],
    clients: BrowserExtensionClient[]
  ) {
    this.on(type, ({ sender, data }) => {
      for (const client of clients) {
        client.send(data, sender)
      }
    })
  }

  dispose() {
    clearInterval(this.#keepAlive)

    this.#transport.dispose()
  }
}
