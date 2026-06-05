/**
 * Ascends the iframe chain from `start`, invoking `visit` with each owning
 * `<iframe>` element from innermost to outermost. Stops when the top frame is
 * reached or `isBoundary` returns true for the current window (the boundary
 * window's owning iframe is not visited).
 *
 * Throws if a frame's owning element is unreachable: returning the partial chain
 * collected so far would resolve a locator against the wrong, shallower frame.
 * Best-effort callers (e.g. pixel offsets) wrap the call in try/catch.
 *
 * Reading `window.frameElement` across origins relies on the recorder and
 * validator launching the browser with web security and site isolation
 * disabled, and on session replay rebuilding iframes as same-origin nodes.
 */
export function forEachOwningFrame(
  start: Window | null,
  isBoundary: (win: Window) => boolean,
  visit: (iframe: Element) => void
): void {
  let win: Window | null = start

  while (win !== null && win !== win.parent && !isBoundary(win)) {
    const iframe = win.frameElement

    if (iframe === null) {
      throw new Error('Could not reach the owning element of a frame')
    }

    visit(iframe)

    win = win.parent
  }
}
