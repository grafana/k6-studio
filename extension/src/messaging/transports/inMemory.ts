import { Transport } from './transport'

export class InMemoryTransport extends Transport {
  send(data: unknown): void {
    this.emit('message', {
      sender: undefined,
      data,
    })
  }
}
