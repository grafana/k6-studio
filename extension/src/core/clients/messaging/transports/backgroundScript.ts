import { runtime, Runtime } from 'webextension-polyfill'

import { Transport } from './transport'

class BackgroundPortTransport extends Transport {
  #port: Runtime.Port

  connected = true

  constructor(port: Runtime.Port) {
    super()

    this.#port = port

    this.#port.onMessage.addListener((message, port) => {
      this.emit('message', {
        transport: this,
        sender: port.sender?.tab?.id?.toString(),
        data: message,
      })
    })

    this.#port.onDisconnect.addListener(() => {
      this.connected = false

      this.emit('disconnect', {
        transport: this,
      })
    })

    this.emit('connect', {
      transport: this,
    })
  }

  send(data: unknown): void {
    this.#port.postMessage(data)
  }

  [Symbol.dispose]() {
    this.#port.disconnect()
  }
}

/**
 * Maintains connections to one or more ports, e.g. from
 * content scripts.
 */
export class BackgroundScriptTransport extends Transport {
  #ports: Array<Transport> = []

  get connected() {
    return this.#ports.length > 0
  }

  constructor() {
    super()

    runtime.onConnect.addListener((port) => {
      const transport = new BackgroundPortTransport(port)

      transport.on('disconnect', () => {
        this.#ports = this.#ports.filter((p) => p !== transport)

        if (this.#ports.length === 0) {
          this.emit('disconnect', {
            transport: this,
          })
        }
      })

      transport.on('message', (ev) => {
        this.emit('message', ev)
      })

      if (this.#ports.length === 0) {
        this.emit('connect', {
          transport: this,
        })
      }

      this.#ports.push(transport)
    })
  }

  send(data: unknown): void {
    for (const port of this.#ports) {
      port.send(data)
    }
  }

  [Symbol.dispose](): void {
    for (const port of this.#ports) {
      port[Symbol.dispose]()
    }
  }
}
