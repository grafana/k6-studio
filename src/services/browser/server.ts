import { BrowserWindow } from 'electron'
import { RawData, WebSocketServer } from 'ws'
import {
  ClientMessageEnvelopeSchema,
  ServerMessage,
  ServerMessageEnvelope,
} from './schemas'

function tryParseMessage(data: RawData) {
  try {
    const decoder = new TextDecoder()
    const chunks = Array.isArray(data) ? data : [data]

    const string = chunks.reduce(
      (result, chunk) => result + decoder.decode(chunk),
      ''
    )

    return JSON.parse(string) as unknown
  } catch (error) {
    return undefined
  }
}

export class BrowserServer {
  #ws: WebSocketServer | null = null

  start(browserWindow: BrowserWindow) {
    this.#ws = new WebSocketServer({
      host: 'localhost',
      port: 7554,
    })

    this.#ws.on('connection', (socket) => {
      console.log('Browser connected...', {
        url: socket.url,
        protocol: socket.protocol,
      })

      socket.on('message', (data) => {
        const message = tryParseMessage(data)

        if (message === undefined) {
          console.log('Failed to parse message as JSON. Dropping.', data)

          return
        }

        const parsed = ClientMessageEnvelopeSchema.safeParse(message)

        if (!parsed.success) {
          console.log('Received malformed message. Dropping.', message)

          return
        }

        console.log('received:', parsed.data)

        browserWindow.webContents.send(
          'browser:event',
          parsed.data.payload.events
        )
      })

      socket.on('close', () => {
        console.log('Browser disconnected...')
      })
    })
  }

  send(message: ServerMessage) {
    if (this.#ws === null) {
      return
    }

    const envelope: ServerMessageEnvelope = {
      messageId: crypto.randomUUID(),
      payload: message,
    }

    this.#ws.clients.forEach((client) => {
      client.send(JSON.stringify(envelope))
    })
  }

  async stop() {
    await new Promise<void>((resolve, reject) =>
      this.#ws?.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    )

    this.#ws = null
  }
}
