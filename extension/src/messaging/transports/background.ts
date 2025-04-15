import { runtime, Runtime } from 'webextension-polyfill'

import { Transport } from './transport'

/**
 * Connects to a background script over a port.
 */
export class BackgroundTransport extends Transport {
  #port: Runtime.Port

  constructor(name: string) {
    super()

    window.addEventListener('pageshow', (ev) => {
      // When a page is put into the back/forward cache the page state is saved
      // but the port gets disconnected. We need to detect when the page is restored
      // and reconnect to the background script. The `persisted` property is true
      // if the page was loaded from the back/forward cache and false if it is a normal
      // page load.
      if (ev.persisted) {
        this.#port.disconnect()
        this.#port = this.#connect(name)
      }
    })

    this.#port = this.#connect(name)
  }

  send(data: unknown): void {
    this.#port.postMessage(data)
  }

  dispose() {
    this.#port.disconnect()
  }

  #connect(name: string) {
    const port = runtime.connect({ name })

    port.onMessage.addListener((message) => {
      this.emit('message', {
        sender: {
          tab: this.#port.sender?.tab?.id?.toString() ?? null,
        },
        data: message,
      })
    })

    port.onDisconnect.addListener(() => {
      this.emit('disconnect', undefined)
    })

    this.emit('connect', undefined)

    return port
  }
}
