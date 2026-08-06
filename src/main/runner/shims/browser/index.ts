import { browser } from 'k6/browser'

import { browserContextProxy, pageProxy } from './proxies/page'
import { registerContext } from './replayDrain'
import { injectSessionReplayScript } from './sessionReplay'
import { createProxy } from './utils'

import '../symbols'

declare module 'k6/browser' {
  // We extend these interfaces to ba able to track specific instances
  interface Page {
    __id?: string
  }

  interface BrowserContext {
    __id?: string
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

  // Contexts the script never created itself still hold pages to drain.
  registerContext(context)

  return createProxy(browserContextProxy(context))
}
