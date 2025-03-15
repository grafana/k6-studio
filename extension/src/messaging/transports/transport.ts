import { EventEmitter } from 'extension/src/utils/events'
import { z } from 'zod'

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

export abstract class Transport extends EventEmitter<TransportMessages> {
  get connected() {
    return true
  }

  abstract send(data: unknown, sender?: Sender): void

  dispose() {}
}
