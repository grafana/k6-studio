import { ChromeDevToolsClient, Runtime } from '@/utils/cdp/client'
import { EventEmitter } from '@/utils/events'

// The recording script runs in an isolated world so that it neither collides
// with the page's own globals nor is broken by pages that mangle built-ins.
// Anything that has to reach it (the tab id global, re-injection after
// document.open) must target the same world.
export const RECORDER_WORLD_NAME = 'k6-studio-recorder'

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

  // Must dispatch the CDP call without awaiting anything first: Page.attach
  // relies on this call being queued before Runtime.runIfWaitingForDebugger.
  async inject(client: ChromeDevToolsClient, runImmediately: boolean) {
    const { identifier } = await client.page.addScriptToEvaluateOnNewDocument({
      source: this.#content,
      worldName: RECORDER_WORLD_NAME,
      runImmediately,
    })

    this.#sessions.push({ client, scriptId: identifier })
  }

  async evaluate(
    client: ChromeDevToolsClient,
    contextId: Runtime.ExecutionContextId
  ) {
    const { exceptionDetails } = await client.runtime.evaluate({
      expression: this.#content,
      contextId,
    })

    // Runtime.evaluate reports a throwing expression on an otherwise
    // successful response, which would silently pass for a working
    // re-injection.
    if (exceptionDetails !== undefined) {
      throw new Error(
        `Script threw during evaluation: ${exceptionDetails.exception?.description ?? exceptionDetails.text}`
      )
    }
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
