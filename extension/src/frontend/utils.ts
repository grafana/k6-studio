declare global {
  interface Window {
    __K6_STUDIO_TAB_ID__?: string
  }
}

/**
 * The CDP recorder will inject a unique tab ID into the window object. If it's not
 * present, we return an empty string and let the background script replace it with
 * the real tab ID.
 */
export function getTabId(): string {
  return window.__K6_STUDIO_TAB_ID__ ?? ''
}
