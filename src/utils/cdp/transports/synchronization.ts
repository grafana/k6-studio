import { ChromeCommand } from '../client'

import { ChromeCallResult } from './schema'

export class RequestSynchronizer {
  #pending = new Map<number, (value: ChromeCallResult) => void>()

  complete(result: ChromeCallResult) {
    const resolver = this.#pending.get(result.id)

    if (resolver === undefined) {
      console.warn('Received response for unknown request id:', result)

      return
    }

    this.#pending.delete(result.id)

    resolver(result)
  }

  call<Return>(command: ChromeCommand): Promise<Return> {
    const { promise, resolve, reject } = Promise.withResolvers<Return>()

    this.#pending.set(command.id, (value: ChromeCallResult) => {
      if ('error' in value) {
        const errorValue = value.error
        const message = (() => {
          if (errorValue instanceof Error) {
            return errorValue.message
          }

          if (typeof errorValue === 'string') {
            return errorValue
          }

          try {
            return JSON.stringify(errorValue)
          } catch {
            return Object.prototype.toString.call(errorValue)
          }
        })()

        reject(new Error(message))

        return
      }

      resolve(value.result as Return)
    })

    return promise
  }
}
