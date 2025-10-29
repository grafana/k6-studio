import { BrowserExtensionClient } from '../messaging'

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

  window.addEventListener(
    'focus',
    () => {
      checkFocus()
    },
    true
  )

  setInterval(checkFocus, 200)
  checkFocus()
}
