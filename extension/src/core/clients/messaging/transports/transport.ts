import { EventEmitter } from 'extension/src/utils/events'

interface TransportEventMap {
  connect: {
    transport: Transport
  }
  disconnect: {
    transport: Transport
  }
  message: {
    transport: Transport
    sender?: string
    data: unknown
  }
}

export abstract class Transport extends EventEmitter<TransportEventMap> {
  abstract readonly connected: boolean
  abstract send(data: unknown): void
  abstract [Symbol.dispose](): void
}
