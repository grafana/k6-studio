import { Transport } from './transport'

/**
 * Stores messages until the underlying transport is connected, then
 * sends them all at once. If the transport is disconnected, it will
 * start storing messages again until the next time the transport is
 * connected.
 */
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

      console.log(
        'Underlying transport connected. Flushing buffer...',
        this.#buffer
      )

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
      console.log(
        'Underlying transport not connected. Buffering message...',
        data
      )
      this.#buffer.push(data)
    }
  }

  dispose() {
    this.#transport.dispose()
  }
}
