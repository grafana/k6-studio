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

    await Promise.all(
      this.#sessions.map((session) => {
        return this.remove(session.client)
          .then(() => this.inject(session.client, false))
          .catch(() => {
            // Reloading the script isn't critical, so we can ignore errors here.
          })
      })
    )

    this.emit('reload', {})
  }
}
