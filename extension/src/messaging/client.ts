import { z } from 'zod'
import { Sender, SenderSchema, Transport } from './transports/transport'
import { BrowserExtensionMessage, BrowserExtensionMessageSchema } from './types'
import { EventEmitter } from '../utils/events'

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

export class BrowserExtensionClient extends EventEmitter<BrowserExtensionClientEvents> {
  #transport: Transport
  #keepAlive: Parameters<typeof clearInterval>[0] = undefined

  constructor(name: string, transport: Transport) {
    super()

    this.#transport = transport

    this.#transport.on('message', ({ sender, data }) => {
      const parsed = BrowserExtensionClientMessageSchema.safeParse(data)

      if (!parsed.success) {
        console.error(`[${name}] received invalid message:`, parsed.error, data)

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

  send(message: BrowserExtensionMessage, sender?: Sender) {
    this.#transport.send({
      type: 'message',
      sender,
      data: message,
    } satisfies MessageEnvelope)
  }

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
