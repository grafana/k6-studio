// If __K6_STUDIO_TAB_ID__ is not set, then we're recording using the browser extension
// and the tabId will be assigned by the background script.
export function getTabId() {
  return window.__K6_STUDIO_TAB_ID__ ?? ''
}
