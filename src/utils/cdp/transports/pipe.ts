import { ChildProcess } from 'child_process'
import { Writable, Readable } from 'stream'

import { safeJsonParse } from '@/utils/json'
import { EventEmitter } from 'extension/src/utils/events'

import { ChromeCommand, ChromeEvent, Transport } from '../client'

import { ChromeResponseSchema } from './schema'
import { RequestSynchronizer } from './synchronization'

export class PipeTransport implements Transport {
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

    return new PipeTransport(send, receive)
  }

  #buffer: string = ''

  #send: Writable
  #receive: Readable

  #requests = new RequestSynchronizer()
  #events = new EventEmitter<Record<string, ChromeEvent>>()

  constructor(send: Writable, receive: Readable) {
    this.#send = send
    this.#receive = receive

    this.#receive.on('data', (data) => {
      const string = String(data)

      const [first = '', rest] = string.split('\u0000')

      this.#buffer += first

      if (rest === undefined) {
        return
      }

      this.#handleMessage(this.#buffer)

      this.#buffer = rest
    })
  }

  call<Return>(command: ChromeCommand): Promise<Return> {
    const message = JSON.stringify(command)

    this.#send.write(message + '\u0000')

    return this.#requests.call<Return>(command)
  }

  on(event: string, listener: (event: ChromeEvent) => void): () => void {
    return this.#events.on(event, listener)
  }

  off(event: string, listener: (event: ChromeEvent) => void): void {
    return this.#events.off(event, listener)
  }

  #handleMessage(data: string) {
    const parsed = safeJsonParse(data)

    if (parsed === undefined) {
      console.warn('Failed to parse CDP message as JSON: ', data)

      return
    }

    const { success, data: message } = ChromeResponseSchema.safeParse(
      JSON.parse(data)
    )

    if (!success) {
      console.warn('Received invalid CDP message:', parsed)

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

  dispose(): void {
    this.#send.end()
    this.#receive.destroy()
  }
}
