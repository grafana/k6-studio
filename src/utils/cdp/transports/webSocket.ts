import logger from 'electron-log/main'
import { z } from 'zod'

import { safeJsonParse } from '@/utils/json'
import { EventEmitter } from 'extension/src/utils/events'

import { ChromeCommand, ChromeEvent, Transport } from '../client'

import { ChromeResponseSchema } from './schema'
import { RequestSynchronizer } from './synchronization'

async function retry<T>(
  retries: number,
  delay: number,
  fn: () => Promise<T>
): Promise<T> {
  const errors = new Map<string, unknown>()

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) {
        break
      }

      const key = err instanceof Error ? err.message : String(err)

      errors.set(key, err)

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  const [first, ...rest] = errors.values()

  if (rest.length === 0) {
    throw first
  }

  throw new AggregateError(
    [first, ...rest],
    `Operation failed after ${retries + 1} attempts`
  )
}

function connectWebSocket(url: string): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url)

    let connected = false

    ws.onopen = () => {
      connected = true
      resolve(ws)
    }

    ws.onclose = ({ code }) => {
      if (connected) {
        return
      }

      switch (code) {
        case 1006: // CLOSE_ABNORMAL
          return reject(
            new Error(
              `WebSocket connection to ${url} closed abnormally (likely network error)`
            )
          )

        case 1002: // CLOSE_PROTOCOL_ERROR
          return reject(
            new Error(`WebSocket protocol error connecting to ${url}`)
          )

        case 1003: // CLOSE_UNSUPPORTED_DATA
          return reject(
            new Error(`WebSocket unsupported data error connecting to ${url}`)
          )

        case 1005: // CLOSE_NO_STATUS
          return reject(
            new Error(`WebSocket connection to ${url} closed without status`)
          )

        case 1015: // CLOSE_TLS_HANDSHAKE
          return reject(
            new Error(`WebSocket TLS handshake failed connecting to ${url}`)
          )

        default:
          return reject(
            new Error(`WebSocket connection to ${url} failed with code ${code}`)
          )
      }
    }
  })
}

const ChromeVersionSchema = z.object({
  webSocketDebuggerUrl: z.string(),
})

interface ConnectOptions {
  port: number
  host?: string
  retries?: number
  delay?: number
}

export class WebSocketTransport implements Transport {
  static async connect({
    port,
    host = 'localhost',
    retries = 50,
    delay = 500,
  }: ConnectOptions): Promise<WebSocketTransport> {
    const url = `http://${host}:${port}/json/version`

    const info = await retry(retries, delay, async () => {
      return fetch(url)
        .then((res) => res.json())
        .then((data) => ChromeVersionSchema.parse(data))
    })

    const ws = await retry(retries, delay, () =>
      connectWebSocket(info.webSocketDebuggerUrl)
    )

    return new WebSocketTransport(ws)
  }

  #ws: WebSocket

  #requests = new RequestSynchronizer()
  #events = new EventEmitter<Record<string, ChromeEvent>>()

  constructor(ws: WebSocket) {
    this.#ws = ws

    this.#ws.onmessage = (event) => {
      if (typeof event.data !== 'string') {
        logger.error(
          'Received non-string message from CDP WebSocket:',
          event.data
        )

        return
      }

      const parsed = safeJsonParse(event.data)

      if (parsed === undefined) {
        logger.error('Failed to parse CDP message as JSON: ', event.data)

        return
      }

      const { success, data: message } = ChromeResponseSchema.safeParse(parsed)

      if (!success) {
        logger.error('Received invalid CDP message:', parsed)

        return
      }

      if ('method' in message) {
        this.#events.emit(message.method, {
          name: message.method,
          sessionId: message.sessionId,
          data: message.params,
        })

        return
      }

      this.#requests.complete(message)
    }
  }

  call<Return>(command: ChromeCommand): Promise<Return> {
    this.#ws.send(JSON.stringify(command))

    return this.#requests.call<Return>(command)
  }

  on(
    event: string,
    listener: (event: ChromeEvent<unknown>) => void
  ): () => void {
    return this.#events.on(event, listener)
  }

  off(event: string, listener: (event: ChromeEvent<unknown>) => void): void {
    return this.#events.off(event, listener)
  }

  dispose(): void {
    this.#ws.close()
  }
}
