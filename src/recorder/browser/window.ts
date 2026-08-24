import { BrowserExtensionClient } from './messaging'

let wasFocused = false

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
