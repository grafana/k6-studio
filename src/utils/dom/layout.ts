import { forEachOwningFrame } from './frameChain'

/**
 * Layout helpers for placing an overlay (e.g. an element highlight) over content
 * that may live inside nested iframes and keeping it aligned as the page shifts.
 */

/**
 * Accumulated offset of `frameWindow`'s frame relative to `rootWindow`'s
 * viewport, or the top frame's viewport when `rootWindow` is null. Zero when the
 * element is already in the root frame. Walks up the iframe chain adding each
 * owning `<iframe>`'s position, which is readable across origins because the
 * recorder disables web security and site isolation. Used to translate element
 * rects and points that originate inside (possibly nested) iframes.
 */
export function getFrameOffset(
  frameWindow: Window | null,
  rootWindow: Window | null = null
): { left: number; top: number } {
  let left = 0
  let top = 0

  try {
    forEachOwningFrame(
      frameWindow,
      (win) => win === rootWindow,
      (iframe) => {
        const rect = iframe.getBoundingClientRect()
        left += rect.left
        top += rect.top
      }
    )
  } catch {
    // Best effort: an unreachable frame leaves the offset partially summed,
    // which only nudges a transient highlight, never a recorded action.
  }

  return { left, top }
}

/**
 * Every window from each content window up through its parent chain, plus
 * `rootWindow`. Intermediate frames are included so scroll listeners cover the
 * full path from a nested element to the overlay root, not just the endpoints.
 */
export function collectLayoutShiftWindows(
  rootWindow: Window | null,
  ...contentWindows: Array<Window | null | undefined>
): Set<Window> {
  const windows = new Set<Window>()

  if (rootWindow !== null) {
    windows.add(rootWindow)
  }

  for (const contentWindow of contentWindows) {
    let win = contentWindow ?? null

    while (win !== null && win !== rootWindow) {
      windows.add(win)

      if (win === win.parent) {
        break
      }

      win = win.parent
    }
  }

  return windows
}

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
