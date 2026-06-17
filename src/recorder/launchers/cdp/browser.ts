import {
  NavigateToPageEvent,
  ReloadPageEvent,
  TabOpenedEvent,
} from '@/schemas/recording'
import { ChromeDevToolsClient, Target, ChromeEvent } from '@/utils/cdp/client'
import { EventEmitter } from '@/utils/events'
import { readResource } from '@/utils/resources'
import { uuid } from '@/utils/uuid'

import { Page } from './page'
import { Script } from './script'

interface BrowserSessionEventMap {
  navigate: { event: NavigateToPageEvent | ReloadPageEvent }
  'tab-opened': { event: TabOpenedEvent }
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

    // The first attached page is the tab the recording started in, every
    // attach after that is a tab opened during the recording.
    const isInitialTab = this.#sessions.size === 0

    const page = new Page(
      data.targetInfo.targetId,
      this.#client.withSession(data.sessionId),
      this.#script
    )

    page.on('navigate', (ev) => {
      this.emit('navigate', ev)
    })

    this.#sessions.set(data.targetInfo.targetId, page)

    if (!isInitialTab) {
      this.emit('tab-opened', {
        event: {
          type: 'tab-opened',
          eventId: uuid(),
          timestamp: Date.now(),
          tab: data.targetInfo.targetId,
        },
      })
    }

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
