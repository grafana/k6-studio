import { BrowserContext, Page } from 'k6/browser'

import { TRACKING_SERVER_URL } from '../utils'

import { flushReplayEvents, registerContext } from './replayDrain'
import { createSingleEntryGuard, onActionEnd } from './utils'

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

async function injectRecorder(page: Page) {
  // The guard runs separately so the recorder bundle is only shipped to pages
  // that don't have it yet.
  const isInjected = await page.evaluate<boolean, undefined>(
    '() => window.__K6_SESSION_REPLAY_TRACKING_SERVER_URL__ !== undefined'
  )

  if (isInjected) {
    return
  }

  await page.evaluate(INJECT_RECORDER_EXPRESSION)
}

// page -> injection in flight. Serializing per page keeps two overlapping
// checks from both missing the recorder and injecting it twice.
const newTabPages = new Map<Page, Promise<void>>()

function ensureRecorder(page: Page) {
  const pending = newTabPages.get(page) ?? Promise.resolve()
  const injection = pending.then(() => injectRecorder(page))

  newTabPages.set(
    page,
    injection.catch(() => undefined)
  )

  return injection
}

/**
 * k6 does not apply context init scripts to pages opened by the page itself
 * (e.g. a popup from a click on a target="_blank" link), so the session replay
 * recorder is injected into such pages once they are obtained through
 * `waitForEvent('page')`. The page stays tracked afterwards: a navigation to a
 * new document wipes the recorder, so it is re-injected after every tracked
 * action for as long as the page is open.
 */
export function injectSessionReplayIntoNewTab(page: Page) {
  if (TRACKING_SERVER_URL === null) {
    return Promise.resolve()
  }

  return ensureRecorder(page)
}

onActionEnd(() => {
  for (const page of newTabPages.keys()) {
    try {
      if (page.isClosed()) {
        newTabPages.delete(page)
        continue
      }

      void ensureRecorder(page).catch(() => undefined)
    } catch {
      // isClosed() throws once the browser is gone
      newTabPages.delete(page)
    }
  }
})
