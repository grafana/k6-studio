import { runtime, Runtime } from 'webextension-polyfill'

import { Transport } from './transport'

/**
 * Connects to a background script over a port.
 */
export class ContentScriptTransport extends Transport {
  #name: string
  #port: Runtime.Port | null = null

  get connected() {
    return this.#port === null
  }

  constructor(name: string) {
    super()

    window.addEventListener('pageshow', (ev) => {
      // When a page is put into the back/forward cache the page state is saved
      // but the port gets disconnected. We need to detect when the page is restored
      // and reconnect to the background script. The `persisted` property is true
      // if the page was loaded from the back/forward cache and false if it is a normal
      // page load.
      if (ev.persisted) {
        this.#port?.disconnect()
        this.#port = this.#connect()
      }
    })

    this.#name = name
    this.#port = this.#connect()
  }

  send(data: unknown): void {
    this.#connect().postMessage(data)
  }

  #connect() {
    if (this.#port !== null) {
      return this.#port
    }

    this.#port = runtime.connect({
      name: this.#name,
    })

    this.#port.onMessage.addListener((message, port) => {
      this.emit('message', {
        transport: this,
        sender: port.sender?.tab?.id?.toString(),
        data: message,
      })
    })

    this.#port.onDisconnect.addListener(() => {
      this.#port = null

      this.emit('disconnect', {
        transport: this,
      })
    })

    this.emit('connect', {
      transport: this,
    })

    return this.#port
  }

  [Symbol.dispose]() {
    this.#port?.disconnect()
  }
}
