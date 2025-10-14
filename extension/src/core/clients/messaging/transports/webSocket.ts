import { Transport } from './transport'

export class WebSocketTransport extends Transport {
  #disposed = false

  #url: string
  #socket: WebSocket | null = null

  get connected() {
    return this.#socket?.readyState === WebSocket.OPEN
  }

  constructor(url: string) {
    super()

    this.#url = url

    this.#connect()
  }

  send(data: unknown): void {
    this.#socket?.send(JSON.stringify(data))
  }

  #connect() {
    const socket = new WebSocket(this.#url)

    socket.addEventListener('open', () => {
      console.log(`WebSocket connection opened to ${this.#url}`)

      this.emit('connect', {
        transport: this,
      })
    })

    socket.addEventListener('message', (event: MessageEvent<unknown>) => {
      if (typeof event.data !== 'string') {
        console.error('WebSocket message data is not a string', event.data)

        return
      }

      this.emit('message', {
        transport: this,
        data: JSON.parse(event.data),
      })
    })

    socket.addEventListener('error', (event) => {
      console.error('WebSocket error.', event)

      this.emit('disconnect', {
        transport: this,
      })

      this.#reconnect()
    })

    socket.addEventListener('close', () => {
      this.emit('disconnect', {
        transport: this,
      })

      this.#reconnect()
    })

    this.#socket = socket
  }

  #reconnect() {
    if (this.#disposed) {
      return
    }

    setTimeout(() => {
      this.#connect()
    }, 2000)
  }

  [Symbol.dispose]() {
    this.#socket?.close()
    this.#socket = null
  }
}
