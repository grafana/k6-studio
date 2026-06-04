/**
 * Recomputes layout-derived state (e.g. a highlight overlay) when any of the
 * given windows scrolls or its document resizes. Scroll neither fires a
 * ResizeObserver nor bubbles across iframe boundaries, so each window is
 * observed and listened to individually, in capture phase to catch inner scroll
 * containers. Callbacks are coalesced to one per animation frame so a burst of
 * scroll events triggers a single recompute. Returns a cleanup function.
 */
export function observeWindowsForLayoutShift(
  windows: Iterable<Window>,
  onLayoutShift: () => void
): () => void {
  let frame = 0

  const schedule = () => {
    if (frame !== 0) {
      return
    }

    frame = requestAnimationFrame(() => {
      frame = 0
      onLayoutShift()
    })
  }

  const observer = new ResizeObserver(schedule)
  const listeningWindows: Window[] = []

  for (const frameWindow of windows) {
    if (frameWindow.document.body !== null) {
      observer.observe(frameWindow.document.body)
    }

    frameWindow.addEventListener('scroll', schedule, {
      capture: true,
      passive: true,
    })

    listeningWindows.push(frameWindow)
  }

  return () => {
    observer.disconnect()

    if (frame !== 0) {
      cancelAnimationFrame(frame)
    }

    for (const frameWindow of listeningWindows) {
      frameWindow.removeEventListener('scroll', schedule, { capture: true })
    }
  }
}
