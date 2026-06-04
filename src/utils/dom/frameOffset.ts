import { forEachOwningFrame } from './frameChain'

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
