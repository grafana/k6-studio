export function isInFrame() {
  try {
    return window.self !== window.top
  } catch (e) {
    return true
  }
}
