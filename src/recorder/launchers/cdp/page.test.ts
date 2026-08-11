import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'
import {
  ChromeCommand,
  ChromeDevToolsClient,
  Transport,
} from '@/utils/cdp/client'

type Listener = Parameters<Transport['on']>[1]

import { Page } from './page'
import { Script } from './script'

class FakeTransport implements Transport {
  calls: ChromeCommand[] = []

  // Url the main frame has committed, reported by Page.getFrameTree
  frameUrl = ''

  #listeners = new Map<string, Set<Listener>>()

  // Mimics a popup opened with noopener/noreferrer: while such a page is
  // paused waiting for the debugger, Chrome doesn't respond to any session
  // command until Runtime.runIfWaitingForDebugger has been sent.
  #holdResponsesUntilResume: boolean
  #heldResponses: Array<() => void> = []

  constructor(holdResponsesUntilResume: boolean) {
    this.#holdResponsesUntilResume = holdResponsesUntilResume
  }

  call<Return>(command: ChromeCommand): Promise<Return> {
    this.calls.push(command)

    const result = (
      command.method === 'Page.getFrameTree'
        ? { frameTree: { frame: { id: 'tab-1', url: this.frameUrl } } }
        : {}
    ) as Return

    if (!this.#holdResponsesUntilResume) {
      return Promise.resolve(result)
    }

    if (command.method === 'Runtime.runIfWaitingForDebugger') {
      this.#holdResponsesUntilResume = false
      this.#heldResponses.splice(0).forEach((respond) => respond())

      return Promise.resolve(result)
    }

    const { promise, resolve } = Promise.withResolvers<Return>()

    this.#heldResponses.push(() => resolve(result))

    return promise
  }

  on(event: string, listener: Listener) {
    const listeners = this.#listeners.get(event) ?? new Set()

    listeners.add(listener)
    this.#listeners.set(event, listeners)

    return () => this.off(event, listener)
  }

  off(event: string, listener: Listener) {
    this.#listeners.get(event)?.delete(listener)
  }

  emit(event: string, data: unknown) {
    this.#listeners.get(event)?.forEach((listener) => {
      listener({ method: event, sessionId: undefined, data } as never)
    })
  }

  dispose() {}
}

function setup(holdResponsesUntilResume = false) {
  const transport = new FakeTransport(holdResponsesUntilResume)
  const client = new ChromeDevToolsClient(transport)
  const page = new Page('tab-1', client, new Script('script-content'))

  const recorded: BrowserEvent[] = []
  page.on('navigate', ({ event }) => recorded.push(event))

  return { transport, page, recorded }
}

function navigateFrame(transport: FakeTransport, url: string) {
  transport.frameUrl = url
  transport.emit('Page.frameStartedNavigating', {
    frameId: 'tab-1',
    url,
    navigationType: 'differentDocument',
  })
  transport.emit('Page.frameNavigated', {
    frame: { id: 'tab-1', url },
  })
}

function scriptCalls(transport: FakeTransport) {
  return transport.calls.filter(
    (call) => call.method === 'Page.addScriptToEvaluateOnNewDocument'
  )
}

describe('Page.attach', () => {
  it(
    'registers scripts before resuming a paused popup that holds command responses until resume',
    { timeout: 1000 },
    async () => {
      const { transport, page } = setup(true)

      await page.attach({ isInitialTab: false, hasOpener: true })

      const methods = transport.calls.map((call) => call.method)

      expect(
        methods.lastIndexOf('Page.addScriptToEvaluateOnNewDocument')
      ).toBeLessThan(methods.indexOf('Runtime.runIfWaitingForDebugger'))
    }
  )

  // Scripts can only run immediately in tabs the page did not open itself. A
  // popup opened by the page attaches before its document exists, and
  // executing the recording script in its empty initial document wedges the
  // renderer of noopener/noreferrer popups. Any other tab (context menu,
  // middle click) commits its first document independently of the debugger
  // pause, so waiting for the next document would lose every event in it.
  it.each([
    { hasOpener: false, runImmediately: true },
    { hasOpener: true, runImmediately: false },
  ])(
    'injects scripts with runImmediately: $runImmediately when hasOpener is $hasOpener',
    async ({ hasOpener, runImmediately }) => {
      const { transport, page } = setup()

      await page.attach({ isInitialTab: true, hasOpener })

      const calls = scriptCalls(transport)

      expect(calls).toHaveLength(2)
      calls.forEach((call) => {
        expect(call.params).toMatchObject({ runImmediately })
      })
    }
  )

  // A tab opened through the context menu or a middle click can commit its
  // first document before Page.enable takes effect, so its navigation never
  // reaches us and the tab would have no entry navigation to export a test
  // from.
  it('records the entry navigation of a tab whose commit was never reported', async () => {
    const { transport, page, recorded } = setup()

    transport.frameUrl = 'https://example.test/page'

    await page.attach({ isInitialTab: false, hasOpener: false })

    expect(recorded).toEqual([
      expect.objectContaining({
        type: 'navigate-to-page',
        url: 'https://example.test/page',
        source: 'address-bar',
        tab: 'tab-1',
      }),
    ])
  })

  it('does not record an entry navigation for the tab the recording starts in', async () => {
    const { transport, page, recorded } = setup()

    transport.frameUrl = 'https://example.test/page'

    await page.attach({ isInitialTab: true, hasOpener: false })

    expect(recorded).toEqual([])
  })

  it('does not record an entry navigation for a popup that has no document yet', async () => {
    const { transport, page, recorded } = setup()

    transport.frameUrl = 'about:blank'

    await page.attach({ isInitialTab: false, hasOpener: true })

    expect(recorded).toEqual([])
  })

  it('does not duplicate an entry navigation that was reported during the attach', async () => {
    const { transport, page, recorded } = setup()

    const attached = page.attach({ isInitialTab: false, hasOpener: false })

    navigateFrame(transport, 'https://example.test/page')

    await attached

    expect(recorded).toHaveLength(1)
    expect(recorded[0]).toMatchObject({ url: 'https://example.test/page' })
  })

  it('records a later return to the entry url', async () => {
    const { transport, page, recorded } = setup()

    transport.frameUrl = 'https://example.test/page'

    await page.attach({ isInitialTab: false, hasOpener: false })

    navigateFrame(transport, 'https://example.test/next')
    navigateFrame(transport, 'https://example.test/page')

    expect(recorded).toHaveLength(3)
    expect(recorded[2]).toMatchObject({ url: 'https://example.test/page' })
  })

  it('records a later navigation of a tab that attached with a document', async () => {
    const { transport, page, recorded } = setup()

    transport.frameUrl = 'https://example.test/page'

    await page.attach({ isInitialTab: false, hasOpener: false })

    navigateFrame(transport, 'https://example.test/next')

    expect(recorded).toHaveLength(2)
    expect(recorded[1]).toMatchObject({ url: 'https://example.test/next' })
  })
})
