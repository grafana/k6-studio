import { Transport } from './transport'
import { WebSocketServer } from 'ws'

export class WebSocketServerTransport extends Transport {
  #server: WebSocketServer

  constructor(host: string, port: number) {
    super()

    this.#server = new WebSocketServer({ host, port })

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
