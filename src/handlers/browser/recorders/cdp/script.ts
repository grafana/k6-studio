import { ChromeDevToolsClient } from '@/utils/cdp/client'
import { EventEmitter } from 'extension/src/utils/events'

interface ScriptEventMap {
  reload: EmptyObject
}

interface ScriptSession {
  client: ChromeDevToolsClient
  scriptId: string
}

export class Script extends EventEmitter<ScriptEventMap> {
  #content: string
  #sessions: ScriptSession[] = []

  constructor(content: string) {
    super()

    this.#content = content
  }

  async inject(client: ChromeDevToolsClient, runImmediately = true) {
    const { identifier } = await client.page.addScriptToEvaluateOnNewDocument({
      source: this.#content,
      runImmediately,
    })

    this.#sessions.push({ client, scriptId: identifier })
  }

  async remove(client: ChromeDevToolsClient) {
    const session = this.#sessions.find((s) => s.client === client)

    if (session === undefined) {
      return
    }

    await client.page.removeScriptToEvaluateOnNewDocument(session.scriptId)

    this.#sessions = this.#sessions.filter((s) => s !== session)
  }

  async reload(newContent: string) {
    this.#content = newContent

    await Promise.allSettled(
      this.#sessions.map(async (session) => {
        await this.remove(session.client)
        await this.inject(session.client, false)
      })
    )

    this.emit('reload', {})
  }
}
