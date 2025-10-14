import { WebSocketServer, WebSocket } from 'ws'

import { Transport } from './transport'

class WebSocketClientTransport extends Transport {
  #socket: WebSocket

  get connected() {
    return this.#socket.readyState === WebSocket.OPEN
  }

  constructor(socket: WebSocket) {
    super()

    this.#socket = socket

    this.#socket.onclose = () => {
      this.emit('disconnect', {
        transport: this,
      })
    }

    this.#socket.onerror = () => {
      this.emit('disconnect', {
        transport: this,
      })
    }

    this.#socket.onmessage = ({ data }) => {
      const chunks = Array.isArray(data) ? data : [data]
      const decoder = new TextDecoder()

      const message = chunks.reduce<string>((acc, chunk) => {
        const decodedValue =
          typeof chunk === 'string' ? chunk : decoder.decode(chunk)

        return acc + decodedValue
      }, '')

      this.emit('message', {
        transport: this,
        data: JSON.parse(message),
      })
    }

    this.emit('connect', { transport: this })
  }

  send(data: unknown): void {
    const message = JSON.stringify(data)

    this.#socket.send(message)
  }

  [Symbol.dispose]() {
    this.#socket.close()
  }
}

export class WebSocketServerError extends AggregateError {
  constructor(errors: unknown[]) {
    super(errors, 'WebSocket server transport error')

    this.name = 'WebSocketServerError'
  }
}

export class WebSocketServerTransport extends Transport {
  static async create(
    host: string,
    port: number
  ): Promise<WebSocketServerTransport> {
    const { resolve, reject, promise } =
      Promise.withResolvers<WebSocketServerTransport>()

    const server = new WebSocketServer({ host, port })

    server.on('listening', () => {
      resolve(new WebSocketServerTransport(server))
    })

    server.on('error', (err) => {
      reject(new WebSocketServerError([err]))
    })

    return promise
  }

  #server: WebSocketServer
  #clients: WebSocketClientTransport[] = []

  get connected() {
    return this.#clients.length > 0
  }

  constructor(server: WebSocketServer) {
    super()

    this.#server = server

    this.#server.on('connection', (socket) => {
      const transport = new WebSocketClientTransport(socket)

      transport.on('disconnect', () => {
        this.#clients = this.#clients.filter((c) => c !== transport)

        if (this.#clients.length === 0) {
          this.emit('disconnect', {
            transport: this,
          })
        }
      })

      transport.on('message', (ev) => {
        this.emit('message', ev)
      })

      if (this.#clients.length === 0) {
        this.emit('connect', {
          transport: this,
        })
      }

      this.#clients.push(transport)
    })
  }

  send(data: unknown): void {
    const message = JSON.stringify(data)

    this.#server.clients.forEach((client) => {
      client.send(message)
    })
  }

  [Symbol.dispose]() {
    this.#server.close()
  }
}
