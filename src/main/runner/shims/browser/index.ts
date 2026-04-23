// @ts-expect-error - This is just a temporary shim to test things.
// eslint-disable-next-line import/no-unresolved
import { expect } from 'https://gist.githubusercontent.com/allansson/5cd3942fd9f028b274769adbdfc44250/raw/410f9fdb85ec4fcb53d1cd4149b0699258c72d75/k6-testing.js'
import { BrowserContext, browser } from 'k6/browser'

import type { AssertionBeginEvent, AssertionEndEvent } from '../../schema'

import { pageProxy } from './proxies/page'
import {
  createSingleEntryGuard,
  createProxy,
  ProxyOptions,
  TRACKING_SERVER_URL,
  beginAssertion,
  endAssertion,
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
  name: 'k6-studio-tracking',
  onBegin(context: {
    negated: boolean
    matcher: { name: string; args: unknown[] }
  }) {
    return beginAssertion(
      context.matcher.name,
      context.negated,
      context.matcher.args
    )
  },
  onEnd(
    context: { result: { passed: true } | { passed: false; error: Error } },
    state: AssertionBeginEvent | null
  ) {
    const result = context.result.passed
      ? { type: 'success' }
      : { type: 'error', error: context.result.error }

    endAssertion(state, result as AssertionEndEvent['result'])
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
