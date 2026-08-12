import logger from 'electron-log/main'
import { describe, expect, it, vi } from 'vitest'

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

  // Context Page.createIsolatedWorld resolves to
  isolatedWorldContextId = 42

  // Methods that respond with an error, e.g. because the frame is gone
  rejectedMethods = new Set<string>()

  // When set, Runtime.evaluate reports that the evaluated expression threw.
  // The CDP call itself still succeeds.
  evaluationThrows = false

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

    if (this.rejectedMethods.has(command.method)) {
      return Promise.reject(new Error(`${command.method} failed`))
    }

    const result = this.#resultFor(command) as Return

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

  emit(event: string, data: unknown, sessionId?: string) {
    this.#listeners.get(event)?.forEach((listener) => {
      listener({ method: event, sessionId, data } as never)
    })
  }

  dispose() {}

  #resultFor(command: ChromeCommand) {
    switch (command.method) {
      case 'Page.getFrameTree':
        return { frameTree: { frame: { id: 'tab-1', url: this.frameUrl } } }

      case 'Page.createIsolatedWorld':
        return { executionContextId: this.isolatedWorldContextId }

      case 'Runtime.evaluate':
        return this.evaluationThrows
          ? {
              result: { type: 'undefined' },
              exceptionDetails: {
                exceptionId: 1,
                text: 'Uncaught',
                lineNumber: 0,
                columnNumber: 0,
                exception: { type: 'object', description: 'Error: boom' },
              },
            }
          : { result: { type: 'undefined' } }

      default:
        return {}
    }
  }
}

function setup({
  holdResponsesUntilResume = false,
  sessionId,
}: { holdResponsesUntilResume?: boolean; sessionId?: string } = {}) {
  const transport = new FakeTransport(holdResponsesUntilResume)
  const client = new ChromeDevToolsClient(transport, sessionId)
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

function callsTo(transport: FakeTransport, method: string) {
  return transport.calls.filter((call) => call.method === method)
}

// Re-injecting the script is asynchronous, so let it settle before asserting.
async function openDocument(
  transport: FakeTransport,
  frameId: string,
  sessionId?: string
) {
  transport.emit('Page.documentOpened', { frame: { id: frameId } }, sessionId)

  await new Promise((resolve) => setTimeout(resolve, 0))
}

describe('Page.attach', () => {
  it(
    'registers scripts before resuming a paused popup that holds command responses until resume',
    { timeout: 1000 },
    async () => {
      const { transport, page } = setup({ holdResponsesUntilResume: true })

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

      const calls = callsTo(transport, 'Page.addScriptToEvaluateOnNewDocument')

      expect(calls).toHaveLength(2)
      calls.forEach((call) => {
        expect(call.params).toMatchObject({
          runImmediately,
          worldName: 'k6-studio-recorder',
        })
      })

      // Both scripts share one isolated world, and the recording script reads
      // the tab id when it starts up, so the tab id has to be registered first.
      expect(calls[0]?.params).toMatchObject({
        source: 'window.__K6_STUDIO_TAB_ID__ = "tab-1";',
      })
      expect(calls[1]?.params).toMatchObject({ source: 'script-content' })
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

// A page can replace its document with `document.open()`. That destroys the
// injected recording script's UI and event listeners, and Chromium does not
// re-run scripts registered with Page.addScriptToEvaluateOnNewDocument for the
// replaced document. The recorder has to evaluate the script again in the
// isolated world it injects into, which Page.createIsolatedWorld returns when
// it survived the replacement and creates otherwise.
describe('document.open', () => {
  it('re-injects the recording script when a document is replaced', async () => {
    const { transport, page } = setup()

    await page.attach({ isInitialTab: true, hasOpener: false })

    await openDocument(transport, 'tab-1')

    const worlds = callsTo(transport, 'Page.createIsolatedWorld')

    expect(worlds).toHaveLength(1)
    expect(worlds[0]?.params).toMatchObject({
      frameId: 'tab-1',
      worldName: 'k6-studio-recorder',
    })

    // The script reads the tab id when it starts up, so the global has to be
    // set before it runs again.
    const calls = callsTo(transport, 'Runtime.evaluate')

    expect(calls).toHaveLength(2)
    expect(calls[0]?.params).toMatchObject({
      expression: 'window.__K6_STUDIO_TAB_ID__ = "tab-1";',
      contextId: 42,
    })
    expect(calls[1]?.params).toMatchObject({
      expression: 'script-content',
      contextId: 42,
    })
  })

  it('re-injects into the frame that opened the document', async () => {
    const { transport, page } = setup()

    await page.attach({ isInitialTab: true, hasOpener: false })

    await openDocument(transport, 'frame-2')

    const worlds = callsTo(transport, 'Page.createIsolatedWorld')

    expect(worlds).toHaveLength(1)
    expect(worlds[0]?.params).toMatchObject({ frameId: 'frame-2' })
    expect(callsTo(transport, 'Runtime.evaluate')).toHaveLength(2)
  })

  it('does not re-inject when the isolated world cannot be created', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => logger)
    const { transport, page } = setup()

    await page.attach({ isInitialTab: true, hasOpener: false })

    transport.rejectedMethods.add('Page.createIsolatedWorld')

    await openDocument(transport, 'tab-1')

    expect(callsTo(transport, 'Runtime.evaluate')).toEqual([])

    // The failure is logged; waiting for it also keeps the rejection chain
    // from settling during a later test.
    await vi.waitFor(() => expect(warn).toHaveBeenCalledOnce())

    warn.mockRestore()
  })

  // Runtime.evaluate reports a throwing expression via exceptionDetails on an
  // otherwise successful response. Treating that as success would leave the
  // recorder dead for the document without any trace in the logs.
  it('logs a warning when the re-injected script throws', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => logger)
    const { transport, page } = setup()

    await page.attach({ isInitialTab: true, hasOpener: false })

    transport.evaluationThrows = true

    await openDocument(transport, 'tab-1')

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      'Failed to re-inject recording script after document.open:',
      expect.any(Error)
    )

    const error: unknown = warn.mock.calls[0]?.[1]

    expect(String(error)).toContain('boom')

    warn.mockRestore()
  })

  it('ignores events addressed to other sessions', async () => {
    const { transport, page } = setup({ sessionId: 'session-1' })

    await page.attach({ isInitialTab: true, hasOpener: false })

    await openDocument(transport, 'tab-1', 'session-2')

    expect(callsTo(transport, 'Page.createIsolatedWorld')).toEqual([])
    expect(callsTo(transport, 'Runtime.evaluate')).toEqual([])
  })

  it('re-injects for events addressed to its own session', async () => {
    const { transport, page } = setup({ sessionId: 'session-1' })

    await page.attach({ isInitialTab: true, hasOpener: false })

    await openDocument(transport, 'tab-1', 'session-1')

    expect(callsTo(transport, 'Page.createIsolatedWorld')).toHaveLength(1)
    expect(callsTo(transport, 'Runtime.evaluate')).toHaveLength(2)
  })
})
