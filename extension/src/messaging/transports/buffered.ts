import { Transport } from './transport'

export class BufferedTransport extends Transport {
  #transport: Transport
  #buffer: Array<unknown> = []

  constructor(transport: Transport) {
    super()

    this.#transport = transport

    this.#transport.on('message', (ev) => {
      this.emit('message', ev)
    })

    this.#transport.on('connect', () => {
      this.emit('connect', undefined)

      for (const message of this.#buffer) {
        this.#transport.send(message)
      }

      this.#buffer = []
    })

    this.#transport.on('disconnect', () => {
      this.emit('disconnect', undefined)
    })
  }

  send(data: unknown): void {
    if (this.#transport.connected) {
      this.#transport.send(data)
    } else {
      this.#buffer.push(data)
    }
  }

  dispose() {
    this.#transport.dispose()
  }
}
