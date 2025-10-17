import { ChildProcess } from 'child_process'

import { EventEmitter } from 'extension/src/utils/events'

import {
  CDPTransport,
  RemotePipeTransport,
  WebsocketRemoteTransport,
} from './transport'
import {
  ChromeEventMap,
  ChromeRequest,
  ChromeRequestMap,
  ChromeResponse,
  ChromeMessageSchema,
  ChromeEvent,
} from './types'

export class ChromeDevtoolsClient extends EventEmitter<ChromeEventMap> {
  static fromChildProcess(process: ChildProcess): ChromeDevtoolsClient {
    return new ChromeDevtoolsClient(
      RemotePipeTransport.fromChildProcess(process)
    )
  }

  static async discoverWebSocket(
    baseUrl: string
  ): Promise<ChromeDevtoolsClient> {
    return new ChromeDevtoolsClient(
      await WebsocketRemoteTransport.discover(baseUrl)
    )
  }

  static async connectToWebSocket(url: string): Promise<ChromeDevtoolsClient> {
    return new ChromeDevtoolsClient(await WebsocketRemoteTransport.connect(url))
  }

  #id: number = 0

  #transport: CDPTransport

  #pending = new Map<number, PromiseWithResolvers<unknown>>()

  constructor(transport: CDPTransport) {
    super()

    this.#transport = transport

    this.#transport.on('message', ({ message }) => {
      const response = JSON.parse(message) as unknown
      const parsed = ChromeMessageSchema.safeParse(response)

      if (!parsed.success) {
        console.warn(
          'Failed to parse message from browser:',
          response,
          parsed.error
        )

        return
      }

      if ('method' in parsed.data) {
        const event = parsed.data as unknown as ChromeEvent

        this.emit(event.method, event.params)

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

  call<Method extends keyof ChromeRequestMap>(
    method: Method,
    params: ChromeRequest<Method>['params']
  ): Promise<ChromeResponse<Method>> {
    const resolvers = Promise.withResolvers<ChromeResponse<Method>>()

    const id = ++this.#id

    this.#pending.set(id, resolvers as PromiseWithResolvers<unknown>)

    this.#transport.send(
      JSON.stringify({
        id,
        method,
        params,
      })
    )

    return resolvers.promise
  }
}
