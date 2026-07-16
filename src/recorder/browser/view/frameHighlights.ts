import { Bounds } from '@/components/Browser/types'
import { LocatorOptions } from '@/schemas/locator'
import { BrowserEventTarget } from '@/schemas/recording'

import { BrowserExtensionClient } from '../messaging'

import { clearChildOverlays, showChildOverlays } from './childOverlays'

const HIGHLIGHT_STYLE = { kind: 'highlight' } as const

/**
 * Resolves the CSS selector chain a `highlight-elements` message targets,
 * outermost frame first. Absent for top-frame elements.
 */
function frameChainSelectors(frames: LocatorOptions[]): (string | undefined)[] {
  return frames.map((frame) => frame.values.css?.selector)
}

/**
 * Whether a message's frame chain identifies this exact frame: same length as
 * this frame's own path, and every link is a css locator matching the
 * corresponding ancestor's own css selector. A message with no frames targets
 * the top frame, never a child, so it never matches here.
 */
function matchesOwnFramePath(
  frames: LocatorOptions[],
  ownPath: BrowserEventTarget[]
): boolean {
  if (frames.length === 0 || frames.length !== ownPath.length) {
    return false
  }

  return frameChainSelectors(frames).every(
    (css, index) => css !== undefined && css === ownPath[index]?.selectors.css
  )
}

function toBounds(element: Element): Bounds {
  const rect = element.getBoundingClientRect()

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

/**
 * Draws or clears this frame's local highlight overlays for `highlight-elements`
 * messages that target it. The recorder's WS server broadcasts every message
 * to every frame, so each frame decides for itself whether the message's frame
 * chain identifies it, then resolves and draws its own matches instead of
 * relying on a top-frame component to descend into it (which cross-origin
 * frames can't do anyway).
 *
 * `getOwnPath` is awaited lazily on the first message and cached, since the
 * chain is stable for the lifetime of the document. A null result (the
 * ancestor chain couldn't be resolved, e.g. an unresponsive cross-origin
 * ancestor) is never cached, so the next message retries in case the ancestor
 * answers later.
 */
export function attachFrameHighlights(
  client: BrowserExtensionClient,
  getOwnPath: () => Promise<BrowserEventTarget[] | null>
): void {
  let ownPath: BrowserEventTarget[] | null = null
  let pendingOwnPath: Promise<BrowserEventTarget[] | null> | null = null
  let latestMessageId = 0

  const resolveOwnPath = async (): Promise<BrowserEventTarget[] | null> => {
    if (ownPath !== null) {
      return ownPath
    }

    if (pendingOwnPath === null) {
      pendingOwnPath = getOwnPath()
    }

    const resolved = await pendingOwnPath

    if (resolved === null) {
      // Don't cache a negative result: the ancestor may still answer later.
      pendingOwnPath = null
    } else {
      ownPath = resolved
    }

    return resolved
  }

  client.on('highlight-elements', ({ data }) => {
    const messageId = ++latestMessageId
    const { locator, frames = [] } = data

    if (locator === null) {
      clearChildOverlays(HIGHLIGHT_STYLE)

      return
    }

    void resolveOwnPath().then((path) => {
      // Messages can arrive faster than own-path resolution settles. Only the
      // outcome of the newest message is allowed to draw or clear, so a slow
      // resolution for an older message can't overwrite a newer one.
      if (messageId !== latestMessageId) {
        return
      }

      if (
        path === null ||
        locator.type !== 'css' ||
        !matchesOwnFramePath(frames, path)
      ) {
        clearChildOverlays(HIGHLIGHT_STYLE)

        return
      }

      const bounds = Array.from(
        document.querySelectorAll(locator.selector)
      ).map(toBounds)

      // An empty match list still draws (with zero boxes) rather than
      // clearing, so "matched this frame, nothing found" and "matched and
      // drew" share one code path.
      showChildOverlays(bounds, HIGHLIGHT_STYLE)
    })
  })
}
