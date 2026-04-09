export function isInFrame() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}

declare global {
  interface Window {
    __K6_STUDIO_TAB_ID__?: string
  }
}

/**
 * The CDP recorder injects a unique tab ID into the window object.
 */
export function getTabId(): string {
  return window.__K6_STUDIO_TAB_ID__ ?? ''
}
