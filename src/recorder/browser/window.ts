import { BrowserExtensionClient } from './messaging'

let wasFocused = false

/**
 * Reports to the client when the tab gains focus. Returns a dispose function:
 * document.open() erases the focus listener but not the interval, so a
 * re-injected copy disposes the previous tracker and starts its own.
 */
export function trackTabFocus(client: BrowserExtensionClient) {
  const checkFocus = () => {
    const tab = window.__K6_STUDIO_TAB_ID__

    if (tab === undefined) {
      return
    }

    const isFocused = document.hasFocus()

    if (isFocused && !wasFocused) {
      client.send({
        type: 'focus-tab',
        tab,
      })
    }

    wasFocused = isFocused
  }

  const handleFocus = () => {
    checkFocus()
  }

  window.addEventListener('focus', handleFocus, true)

  const interval = setInterval(checkFocus, 200)

  checkFocus()

  return function dispose() {
    window.removeEventListener('focus', handleFocus, true)
    clearInterval(interval)
  }
}
