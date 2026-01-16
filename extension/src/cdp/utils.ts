export function isInFrame() {
  try {
    return window.self !== window.top
  } catch {
    return true
  }
}
