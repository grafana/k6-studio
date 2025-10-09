import { ChildProcess } from 'child_process'
import { Readable, Writable } from 'stream'
import { z } from 'zod'

import { EventEmitter } from 'extension/src/utils/events'

interface CDPTransportEventMap {
  message: { message: string }
}

export interface CDPTransport extends EventEmitter<CDPTransportEventMap> {
  send(message: string): void
}

export class RemotePipeTransport
  extends EventEmitter<CDPTransportEventMap>
  implements CDPTransport
{
  static fromChildProcess(process: ChildProcess) {
    const send = process.stdio[3]
    const receive = process.stdio[4]

    if (send instanceof Writable === false) {
      throw new Error(
        'File descriptor 3 must be writable to send commands over CDP to the browser.'
      )
    }

    if (receive instanceof Readable === false) {
      throw new Error(
        'File descriptor 4 must be readable to receive responses from CDP in the browser.'
      )
    }

    return new RemotePipeTransport(send, receive)
  }

  #buffer: string = ''

  #send: Writable
  #receive: Readable

  constructor(send: Writable, receive: Readable) {
    super()

    this.#send = send
    this.#receive = receive

    this.#receive.on('data', (data) => {
      const string = String(data)

      const [first = '', rest] = string.split('\u0000')

      this.#buffer += first

      if (rest === undefined) {
        return
      }

      this.emit('message', { message: this.#buffer })

      this.#buffer = rest
    })
  }

  send(message: string) {
    this.#send.write(message + '\u0000')
  }
}

const ChromeVersionSchema = z.object({
  webSocketDebuggerUrl: z.string(),
})

async function retry<T>(
  retries: number,
  delay: number,
  fn: () => Promise<T>
): Promise<T> {
  const errors: unknown[] = []

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      errors.push(error)

      if (attempt >= retries) {
        break
      }

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new AggregateError(errors, 'All retry attempts failed')
}

export class WebsocketRemoteTransport
  extends EventEmitter<CDPTransportEventMap>
  implements CDPTransport
{
  static async discover(url: string) {
    const version = await retry(20, 100, () => fetch(`${url}/json/version`))
      .then((res) => res.json())
      .then((data) => ChromeVersionSchema.parse(data))

    return this.connect(version.webSocketDebuggerUrl)
  }

  static async connect(url: string) {
    const ws = await new Promise<WebSocket>((resolve, reject) => {
      const socket = new WebSocket(url)

      socket.addEventListener('open', () => resolve(socket))
      socket.addEventListener('error', (err) => reject(err))
    })

    return new WebsocketRemoteTransport(ws)
  }

  #ws: WebSocket

  constructor(ws: WebSocket) {
    super()

    this.#ws = ws

    this.#ws.addEventListener('message', (event) => {
      if (typeof event.data !== 'string') {
        return
      }

      this.emit('message', { message: event.data })
    })
  }

  send(message: string) {
    this.#ws.send(message)
  }
}
