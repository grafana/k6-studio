import { NavigateToPageEvent, ReloadPageEvent } from '@/schemas/recording'
import { ChromeDevToolsClient, Target, ChromeEvent } from '@/utils/cdp/client'
import { readResource } from '@/utils/resources'
import { EventEmitter } from 'extension/src/utils/events'

import { Page } from './page'
import { Script } from './script'

interface BrowserSessionEventMap {
  navigate: { event: NavigateToPageEvent | ReloadPageEvent }
}

export class BrowserSession extends EventEmitter<BrowserSessionEventMap> {
  #client: ChromeDevToolsClient
  #script: Script

  #sessions = new Map<string, Page>()

  constructor(client: ChromeDevToolsClient, script: Script) {
    super()

    this.#client = client
    this.#script = script

    this.#client.target.on('attachedToTarget', this.#handleAttachedToTarget)
    this.#client.target.on('detachedFromTarget', this.#handleDetachedFromTarget)
  }

  async attach() {
    await this.#client.target.setAutoAttach({
      autoAttach: true,
      waitForDebuggerOnStart: true,
      flatten: true,
      filter: [{ type: 'page', exclude: false }, { exclude: true }],
    })

    return this
  }

  getPage(tabId: string) {
    return this.#sessions.get(tabId)
  }

  async reloadScript() {
    const newScript = await readResource('browser-script')

    await this.#script.reload(newScript)
  }

  #handleAttachedToTarget = async ({
    data,
  }: ChromeEvent<Target.AttachedToTargetEvent>) => {
    if (data.targetInfo.type !== 'page') {
      return
    }

    const page = new Page(
      data.targetInfo.targetId,
      this.#client.withSession(data.sessionId),
      this.#script
    )

    page.on('navigate', (ev) => {
      this.emit('navigate', ev)
    })

    this.#sessions.set(data.targetInfo.targetId, page)

    await page.attach()
  }

  #handleDetachedFromTarget = ({
    data,
  }: ChromeEvent<Target.DetachedFromTargetEvent>) => {
    const page = this.#sessions.get(data.targetId)

    if (page === undefined) {
      return
    }

    page.dispose()

    this.#sessions.delete(data.targetId)
  }

  dispose() {
    this.#client.dispose()
  }
}
