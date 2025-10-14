import { Transport } from './transport'

export class LoopbackTransport extends Transport {
  get connected() {
    return true
  }

  send(data: unknown): void {
    setTimeout(() => {
      this.emit('message', {
        transport: this,
        data,
      })
    }, 0)
  }

  [Symbol.dispose](): void {}
}
