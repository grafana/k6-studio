import { getFrameOffset } from '@/utils/dom/layout'

interface Point {
  x: number
  y: number
}

/**
 * The replayed page can contain nested iframes. Their content is reconstructed
 * as same-origin documents inside the player, but DOM events don't cross iframe
 * boundaries, so interaction listeners have to be attached to each document.
 * Returns the root document plus every (recursively) nested iframe document.
 */
export function collectReplayDocuments(root: Document): Document[] {
  const documents: Document[] = [root]

  for (const iframe of root.querySelectorAll('iframe')) {
    const nested = iframe.contentDocument

    if (nested !== null) {
      documents.push(...collectReplayDocuments(nested))
    }
  }

  return documents
}

/**
 * Adds a `load` listener to every iframe in `documents` so the caller can
 * re-attach interaction listeners once rrweb finishes rebuilding an iframe's
 * content (which happens asynchronously, after the snapshot is rebuilt).
 * Returns a cleanup that removes the listeners.
 */
export function attachIframeReloadListeners(
  documents: Document[],
  onReload: () => void
): () => void {
  const iframes = documents.flatMap((document) => [
    ...document.querySelectorAll('iframe'),
  ])

  for (const iframe of iframes) {
    iframe.addEventListener('load', onReload)
  }

  return () => {
    for (const iframe of iframes) {
      iframe.removeEventListener('load', onReload)
    }
  }
}

interface InteractionHandlers {
  onClick: (event: PointerEvent) => void
  onReload: () => void
}

// Events that would let the replay navigate (following links, submitting forms)
// when interaction is enabled. We surface clicks to the caller but block these.
const BLOCKED_EVENTS = ['submit', 'keydown', 'keypress', 'contextmenu']

/**
 * Attaches click and navigation-blocking listeners to every replay document
 * (DOM events don't cross iframe boundaries, so each needs its own), and
 * re-runs when an iframe loads. Returns a cleanup that detaches everything.
 */
export function attachInteractionListeners(
  documents: Document[],
  { onClick, onReload }: InteractionHandlers
): () => void {
  const preventInteraction = (event: Event) => {
    event.preventDefault()
  }

  const cleanups = documents.flatMap((document) => {
    const root = document.documentElement

    if (root === null) {
      return []
    }

    for (const type of BLOCKED_EVENTS) {
      root.addEventListener(type, preventInteraction, true)
    }

    root.addEventListener('click', onClick, true)

    return [
      () => {
        for (const type of BLOCKED_EVENTS) {
          root.removeEventListener(type, preventInteraction, true)
        }

        root.removeEventListener('click', onClick, true)
      },
    ]
  })

  const detachReloadListeners = attachIframeReloadListeners(documents, onReload)

  return () => {
    for (const cleanup of cleanups) {
      cleanup()
    }

    detachReloadListeners()
  }
}

/**
 * Maps a click that happened anywhere in the replay (including inside a nested
 * iframe) to a position in the app's viewport, accounting for each iframe's
 * offset and the player's own scaling. For a top-frame click this reduces to the
 * player iframe's rect mapping.
 */
export function getReplayClickPosition(
  target: Element,
  playerIframe: HTMLIFrameElement,
  clientX: number,
  clientY: number
): Point {
  // Accumulate the offset of each iframe the click happened inside, up to the
  // player's own document, then map through the player's scaling.
  const offset = getFrameOffset(
    target.ownerDocument.defaultView,
    playerIframe.contentWindow
  )

  const x = clientX + offset.left
  const y = clientY + offset.top

  const rect = playerIframe.getBoundingClientRect()

  return {
    x: rect.left + (x / playerIframe.offsetWidth) * rect.width,
    y: rect.top + (y / playerIframe.offsetHeight) * rect.height,
  }
}
