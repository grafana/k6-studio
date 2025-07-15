import { WebSocketServer } from 'ws'

import { Transport } from './transport'

export class WebSocketServerTransport extends Transport {
  static async create(
    host: string,
    port: number
  ): Promise<WebSocketServerTransport> {
    return new Promise<WebSocketServerTransport>((resolve, reject) => {
      const server = new WebSocketServer({ host, port })

      server.on('listening', () => {
        resolve(new WebSocketServerTransport(server))
      })

      server.on('error', reject)
    })
  }

  #server: WebSocketServer

  constructor(server: WebSocketServer) {
    super()

    this.#server = server

    this.#server.on('connection', (socket) => {
      socket.on('message', (data) => {
        const chunks = Array.isArray(data) ? data : [data]
        const decoder = new TextDecoder()

        const message = chunks.reduce((acc, chunk) => {
          return acc + decoder.decode(chunk)
        }, '')

        this.emit('message', {
          sender: undefined,
          data: JSON.parse(message),
        })
      })
    })
  }

  send(data: unknown): void {
    const message = JSON.stringify(data)

    this.#server.clients.forEach((client) => {
      client.send(message)
    })
  }

  dispose() {
    this.#server.close()
  }
}
