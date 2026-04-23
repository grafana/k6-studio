// @ts-expect-error - This is just a temporary shim to test things.
// eslint-disable-next-line import/no-unresolved
import { expect } from 'https://gist.githubusercontent.com/allansson/5cd3942fd9f028b274769adbdfc44250/raw/faed7cc1f70fcc673e4cd8fb5a5c7c0b682643d9/index.js'
import { BrowserContext, browser } from 'k6/browser'

import { pageProxy } from './proxies/page'
import {
  createSingleEntryGuard,
  createProxy,
  ProxyOptions,
  TRACKING_SERVER_URL,
  trackLog,
} from './utils'

declare module 'k6/browser' {
  // We extend these interfaces to ba able to track specific instances
  interface Page {
    __id?: string
  }

  interface BrowserContext {
    __id?: string
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
expect.use({
  onBegin() {
    trackLog({
      level: 'info',
      msg: 'Assertion called',
      time: new Date().toISOString(),
      source: 'browser',
      process: 'browser',
    })
  },
  onEnd() {
    trackLog({
      level: 'info',
      msg: 'Assertion ended',
      time: new Date().toISOString(),
      source: 'browser',
      process: 'browser',
    })
  },
})

// NOTE: This placeholder is replaced with the actual session replay script during the instrumentation process.
const SESSION_REPLAY_SCRIPT = ''

const isContextInitialized = createSingleEntryGuard()

async function injectSessionReplayScript(context: BrowserContext) {
  if (!isContextInitialized(context)) {
    return
  }

  await context.addInitScript(
    `window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = ${JSON.stringify(TRACKING_SERVER_URL)};`
  )

  await context.addInitScript(SESSION_REPLAY_SCRIPT)
}

function browserContextProxy(
  target: BrowserContext
): ProxyOptions<BrowserContext> {
  return {
    target,
    tracking: {},
    proxies: {
      newPage(target) {
        return pageProxy(target)
      },
    },
  }
}

const nativeNewPage = browser.newPage.bind(browser)
const nativeNewContext = browser.newContext.bind(browser)
const nativeContext = browser.context.bind(browser)

browser.newPage = async function (...args) {
  const page = await nativeNewPage(...args)

  await injectSessionReplayScript(page.context())

  return createProxy(pageProxy(page))
}

browser.newContext = async function (...args) {
  const context = await nativeNewContext(...args)

  await injectSessionReplayScript(context)

  return createProxy(browserContextProxy(context))
}

browser.context = function (...args) {
  const context = nativeContext(...args)

  if (context === null) {
    return null
  }

  return createProxy(browserContextProxy(context))
}
