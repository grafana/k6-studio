import { z } from 'zod'

import { EventEmitter } from 'extension/src/utils/events'

interface TransportMessages {
  connect: void
  disconnect: void
  message: {
    sender?: Sender
    data: unknown
  }
}

export const SenderSchema = z.object({
  tab: z.string().nullable(),
})

export type Sender = z.infer<typeof SenderSchema>

/**
 * A generic transport that can do two things:
 *
 * * Send data over some channel (e.g. a web socket, a message port, etc.)
 * * Receive messages from the channel (via the "message" event)`)
 *
 * This abstraction lets us send data without caring about how it's being sent.
 */
export abstract class Transport extends EventEmitter<TransportMessages> {
  get connected() {
    return true
  }

  abstract send(data: unknown, sender?: Sender): void

  dispose() {}
}
