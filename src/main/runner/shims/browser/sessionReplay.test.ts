import { BrowserContext, Page } from 'k6/browser'
import { describe, expect, it, vi } from 'vitest'

import '../symbols'

vi.hoisted(() => {
  ;(globalThis as { __ENV?: Record<string, string> }).__ENV = {
    K6_TRACKING_SERVER_PORT: '1234',
  }
})

// Module state (tracked new-tab pages, action-end hooks) leaks between tests,
// so every test gets its own copy of the module graph.
async function loadModules() {
  vi.resetModules()

  const sessionReplay = await import('./sessionReplay')
  const { pageProxy } = await import('./proxies/page')
  const { createProxy } = await import('./utils')

  return {
    injectIntoNewTab: (page: FakePage) => {
      return sessionReplay.injectSessionReplayIntoNewTab(
        page as unknown as Page
      )
    },
    proxyPage: (page: FakePage) => {
      return createProxy(pageProxy(page as unknown as Page))
    },
  }
}

// A page whose recorder state is wiped when it navigates to a new document,
// like a real popup. The guard evaluate reads the state, the injection
// evaluate sets it.
function fakePage() {
  let closed = false

  const page = {
    hasRecorder: false,

    navigateToNewDocument() {
      page.hasRecorder = false
    },

    on: vi.fn(),
    isClosed: vi.fn(() => closed),
    goto: vi.fn(() => Promise.resolve()),
    reload: vi.fn(() => Promise.resolve()),
    close: vi.fn(() => {
      closed = true

      return Promise.resolve()
    }),
    evaluate: vi.fn((expression: string) => {
      if (String(expression).includes('!== undefined')) {
        return Promise.resolve(page.hasRecorder)
      }

      page.hasRecorder = true

      return Promise.resolve(undefined)
    }),
    context: vi.fn(() => ({}) as BrowserContext),
  }

  return page
}

type FakePage = ReturnType<typeof fakePage>

describe('session replay in new tabs', () => {
  it('injects the recorder into a page that does not have it', async () => {
    const { injectIntoNewTab } = await loadModules()
    const popup = fakePage()

    await injectIntoNewTab(popup)

    expect(popup.hasRecorder).toBe(true)
  })

  it('does not ship the recorder again when it is already present', async () => {
    const { injectIntoNewTab } = await loadModules()
    const popup = fakePage()

    await injectIntoNewTab(popup)
    await injectIntoNewTab(popup)

    // One guard + one injection, then one guard that hits
    expect(popup.evaluate).toHaveBeenCalledTimes(3)
  })

  // k6 does not apply context init scripts to page-opened tabs, so a popup
  // that navigates to a new document loses the recorder. Tracked pages get it
  // re-injected after every tracked action.
  it('re-injects the recorder after the popup navigates to a new document', async () => {
    const { injectIntoNewTab, proxyPage } = await loadModules()
    const popup = fakePage()
    const main = proxyPage(fakePage())

    await injectIntoNewTab(popup)

    popup.navigateToNewDocument()

    // Any tracked action triggers the action-end hooks
    await main.goto('https://example.com')

    await vi.waitFor(() => {
      expect(popup.hasRecorder).toBe(true)
    })
  })

  it('stops re-injecting once the popup is closed', async () => {
    const { injectIntoNewTab, proxyPage } = await loadModules()
    const popup = fakePage()
    const main = proxyPage(fakePage())

    await injectIntoNewTab(popup)
    await popup.close()

    popup.hasRecorder = false
    popup.evaluate.mockClear()

    await main.goto('https://example.com')
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(popup.evaluate).not.toHaveBeenCalled()
  })
})
