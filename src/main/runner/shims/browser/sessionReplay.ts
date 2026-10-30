import { BrowserContext, Frame, Page } from 'k6/browser'

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

async function injectRecorder(frame: Page | Frame) {
  // The guard avoids shipping the recorder bundle to documents that already have it.
  const isInjected = await frame.evaluate<boolean, undefined>(
    '() => window.__K6_REPLAY_INSTALLED__ === true'
  )

  if (isInjected) {
    return
  }

  await frame.evaluate(INJECT_RECORDER_EXPRESSION)
}

async function injectPopupFrames(page: Page) {
  await injectRecorder(page)

  const children = page.frames().filter((frame) => frame.parentFrame() !== null)

  await Promise.allSettled(children.map((frame) => injectRecorder(frame)))
}

// page -> injection in flight. Serializing per page keeps two overlapping
// checks from both missing the recorder and injecting it twice.
const newTabPages = new Map<Page, Promise<void>>()

function ensureRecorder(page: Page) {
  const pending = newTabPages.get(page) ?? Promise.resolve()
  const injection = pending.then(() => injectPopupFrames(page))

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
 * new document wipes the recorder, so every descendant document is checked
 * after each tracked action for as long as the page is open.
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
