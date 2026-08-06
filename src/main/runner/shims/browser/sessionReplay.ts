import { BrowserContext, Page } from 'k6/browser'

import { TRACKING_SERVER_URL } from '../utils'

import { flushReplayEvents, registerContext } from './replayDrain'
import { createSingleEntryGuard } from './utils'

// NOTE: This placeholder is replaced with the actual session replay script during the instrumentation process.
const SESSION_REPLAY_SCRIPT = ''

const TRACKING_SERVER_URL_ASSIGNMENT = `window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ = ${JSON.stringify(TRACKING_SERVER_URL)};`

// The strings are function expressions because k6's evaluate only accepts
// those. Built once: the recorder script is a few hundred kilobytes.
const INJECT_RECORDER_EXPRESSION = `() => {\n${TRACKING_SERVER_URL_ASSIGNMENT}\n${SESSION_REPLAY_SCRIPT}\n}`

const isContextInitialized = createSingleEntryGuard()

/**
 * Closing a context destroys its pages, taking whatever they recorded since the
 * last drain with them.
 */
function drainOnClose(context: BrowserContext) {
  const close = context.close.bind(context)

  context.close = async () => {
    await flushReplayEvents()

    await close()
  }
}

export async function injectSessionReplayScript(context: BrowserContext) {
  registerContext(context)

  if (!isContextInitialized(context)) {
    return
  }

  drainOnClose(context)

  await context.addInitScript(TRACKING_SERVER_URL_ASSIGNMENT)
  await context.addInitScript(SESSION_REPLAY_SCRIPT)
}

/**
 * k6 does not apply context init scripts to pages opened by the page itself
 * (e.g. a popup from a click on a target="_blank" link), so the session replay
 * recorder is injected into such pages once they are obtained through
 * `waitForEvent('page')`. The guard runs separately so the recorder bundle is
 * only shipped to pages that don't have it yet.
 */
export async function injectSessionReplayIntoNewTab(page: Page) {
  if (TRACKING_SERVER_URL === null) {
    return
  }

  const isInjected = await page.evaluate<boolean, undefined>(
    '() => window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ !== undefined'
  )

  if (isInjected) {
    return
  }

  await page.evaluate(INJECT_RECORDER_EXPRESSION)
}
