import { ChildProcess } from 'child_process'
import { Readable, Writable } from 'stream'

import {
  ChromeRequest,
  ChromeRequestMap,
  ChromeResponse,
  ChromeResponseSchema,
} from './types'

export class ChromeDevtoolsClient {
  static fromChildProcess(process: ChildProcess): ChromeDevtoolsClient {
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

    return new ChromeDevtoolsClient(send, receive)
  }

  #id: number = 0

  #buffer: string = ''

  #send: Writable
  #receive: Readable

  #pending = new Map<number, PromiseWithResolvers<unknown>>()

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

      const response = JSON.parse(this.#buffer) as unknown
      const parsed = ChromeResponseSchema.safeParse(response)

      this.#buffer = rest

      if (!parsed.success) {
        console.error(
          'Failed to parse response from browser:',
          response,
          parsed.error
        )

        return
      }

      const resolver = this.#pending.get(parsed.data.id)

      if (resolver === undefined) {
        return
      }

      if ('error' in parsed.data) {
        resolver.reject(parsed.data.error)

        return
      }

      resolver.resolve(parsed.data.result)
    })
  }

  call<K extends keyof ChromeRequestMap>(
    command: ChromeRequest<K>
  ): Promise<ChromeResponse<K>> {
    const resolvers = Promise.withResolvers<ChromeResponse<K>>()

    const id = ++this.#id

    this.#pending.set(id, resolvers as PromiseWithResolvers<unknown>)

    const data = JSON.stringify({
      ...command,
      id,
    })

    this.#send.write(data + '\u0000')

    return resolvers.promise
  }
}
