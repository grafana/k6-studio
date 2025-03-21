import { runtime, Runtime } from 'webextension-polyfill'

import { Transport } from './transport'

export class BackgroundTransport extends Transport {
  #port: Runtime.Port

  constructor(name: string) {
    super()

    this.#port = runtime.connect({ name })

    this.#port.onMessage.addListener((message) => {
      this.emit('message', {
        sender: {
          tab: this.#port.sender?.tab?.id?.toString() ?? null,
        },
        data: message,
      })
    })

    this.#port.onDisconnect.addListener(() => {
      this.emit('disconnect', undefined)
    })

    this.emit('connect', undefined)
  }

  send(data: unknown): void {
    this.#port.postMessage(data)
  }

  dispose() {
    this.#port.disconnect()
  }
}
