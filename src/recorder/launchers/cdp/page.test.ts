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

    const result = {} as Return

    if (!this.#holdResponsesUntilResume) {
      return Promise.resolve(result)
    }

    if (command.method === 'Runtime.runIfWaitingForDebugger') {
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

      await page.attach({ url: '', isInitialTab: false })

      const methods = transport.calls.map((call) => call.method)

      expect(
        methods.lastIndexOf('Page.addScriptToEvaluateOnNewDocument')
      ).toBeLessThan(methods.indexOf('Runtime.runIfWaitingForDebugger'))
    }
  )

  // Scripts can only run immediately in a target that already has a document.
  // A popup opened by the page attaches before its document exists (empty
  // url), and executing the recording script in its empty initial document
  // wedges the renderer of noopener/noreferrer popups. A tab opened through
  // the context menu attaches with its url already set: that document is the
  // one the user interacts with, so skipping it loses every event in it.
  it.each([
    { url: 'https://example.test/page', runImmediately: true },
    { url: '', runImmediately: false },
    { url: 'about:blank', runImmediately: false },
  ])(
    'injects scripts with runImmediately: $runImmediately for url "$url"',
    async ({ url, runImmediately }) => {
      const { transport, page } = setup()

      await page.attach({ url, isInitialTab: true })

      const calls = scriptCalls(transport)

      expect(calls).toHaveLength(2)
      calls.forEach((call) => {
        expect(call.params).toMatchObject({ runImmediately })
      })
    }
  )

  // A tab opened through the context menu has already committed its document
  // when we attach, so its navigation never reaches us and the tab would have
  // no entry navigation to export a test from.
  it('records the entry navigation of a tab that attached with a document', async () => {
    const { page, recorded } = setup()

    await page.attach({ url: 'https://example.test/page', isInitialTab: false })

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
    const { page, recorded } = setup()

    await page.attach({ url: 'https://example.test/page', isInitialTab: true })

    expect(recorded).toEqual([])
  })

  it('does not record an entry navigation for a popup that has no document yet', async () => {
    const { page, recorded } = setup()

    await page.attach({ url: '', isInitialTab: false })

    expect(recorded).toEqual([])
  })

  it('does not record the same entry navigation twice when the navigation still arrives', async () => {
    const { transport, page, recorded } = setup()

    await page.attach({ url: 'https://example.test/page', isInitialTab: false })

    navigateFrame(transport, 'https://example.test/page')

    expect(recorded).toHaveLength(1)
  })

  // A context-menu tab can attach while still paused on its entry navigation,
  // in which case the commit events race the rest of the attach sequence.
  it('does not duplicate the entry navigation when its commit races the attach', async () => {
    const { transport, page, recorded } = setup()

    const attached = page.attach({
      url: 'https://example.test/page',
      isInitialTab: false,
    })

    navigateFrame(transport, 'https://example.test/page')

    await attached

    expect(recorded).toHaveLength(1)
  })

  // Suppression must only cover the entry navigation itself: once any other
  // navigation has happened, returning to the entry url is a new navigation.
  it('records a later return to the entry url', async () => {
    const { transport, page, recorded } = setup()

    await page.attach({ url: 'https://example.test/page', isInitialTab: false })

    navigateFrame(transport, 'https://example.test/next')
    navigateFrame(transport, 'https://example.test/page')

    expect(recorded).toHaveLength(3)
    expect(recorded[2]).toMatchObject({ url: 'https://example.test/page' })
  })

  it('records a later navigation of a tab that attached with a document', async () => {
    const { transport, page, recorded } = setup()

    await page.attach({ url: 'https://example.test/page', isInitialTab: false })

    navigateFrame(transport, 'https://example.test/next')

    expect(recorded).toHaveLength(2)
    expect(recorded[1]).toMatchObject({ url: 'https://example.test/next' })
  })
})
