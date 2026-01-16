export function isInFrame() {
  try {
    return window.self !== window.top
  } catch (_error) {
    return true
  }
}
