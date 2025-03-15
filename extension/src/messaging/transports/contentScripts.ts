import { runtime, Runtime } from 'webextension-polyfill'
import { Transport } from './transport'

export class ContentScriptsTransport extends Transport {
  #ports: Array<Runtime.Port> = []

  constructor() {
    super()

    runtime.onConnect.addListener((port) => {
      this.#ports.push(port)

      port.onMessage.addListener((message) => {
        this.emit('message', {
          sender: {
            tab: port.sender?.tab?.id?.toString() ?? null,
          },
          data: message,
        })
      })

      port.onDisconnect.addListener(() => {
        this.#ports = this.#ports.filter((p) => p !== port)
      })
    })
  }

  send(data: unknown): void {
    for (const port of this.#ports) {
      port.postMessage(data)
    }
  }
}
