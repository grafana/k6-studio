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

      this.emit('connect', undefined)
    })

    socket.addEventListener('message', (event: MessageEvent<string>) => {
      this.emit('message', {
        sender: undefined,
        data: JSON.parse(event.data),
      })
    })

    socket.addEventListener('error', (event) => {
      console.error('WebSocket error.', event)

      this.emit('disconnect', undefined)

      this.#reconnect()
    })

    socket.addEventListener('close', () => {
      this.emit('disconnect', undefined)

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

  dispose() {
    this.#socket?.close()
    this.#socket = null
  }
}
