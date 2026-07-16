import { Bounds } from '@/components/Browser/types'

// Vanilla DOM overlay renderer for cross-origin child frames, which have no
// React tree of their own. It draws hover/highlight boxes directly.
//
// The container must not disturb the selector generator, which walks the
// light DOM starting at `document.body` (see `src/utils/dom/selectors.ts`).
// We follow the same mitigation as the top-frame mount in `view/index.tsx`:
// the overlay markup lives inside an open shadow root, so it never appears
// in `document.body`'s light DOM tree, and the shadow root's first child
// carries the `data-ksix-studio` marker used to identify Studio UI.
export interface ChildOverlayStyle {
  kind: 'hover' | 'highlight'
}

interface OverlayContainer {
  container: HTMLDivElement
  root: HTMLDivElement
}

const MAX_Z_INDEX = 2147483647

const containersByKind = new Map<ChildOverlayStyle['kind'], OverlayContainer>()

function applyOverlayVisuals(
  overlay: HTMLDivElement,
  kind: ChildOverlayStyle['kind']
) {
  if (kind === 'hover') {
    overlay.style.border = '2px solid #0093ff'

    return
  }

  overlay.style.backgroundColor = 'rgba(0, 147, 255, 0.24)'
}

function createOverlayContainer(): OverlayContainer {
  const container = document.createElement('div')

  document.body.appendChild(container)

  const shadowRoot = container.attachShadow({ mode: 'open' })

  const root = document.createElement('div')

  root.dataset.ksixStudio = 'true'

  shadowRoot.appendChild(root)

  return { container, root }
}

function getOverlayContainer(
  kind: ChildOverlayStyle['kind']
): OverlayContainer {
  const existing = containersByKind.get(kind)

  if (existing) {
    return existing
  }

  const created = createOverlayContainer()

  containersByKind.set(kind, created)

  return created
}

function createOverlay(
  bounds: Bounds,
  kind: ChildOverlayStyle['kind']
): HTMLDivElement {
  const overlay = document.createElement('div')

  overlay.style.position = 'fixed'
  overlay.style.pointerEvents = 'none'
  overlay.style.zIndex = String(MAX_Z_INDEX)
  overlay.style.boxSizing = 'border-box'
  overlay.style.top = `${bounds.top}px`
  overlay.style.left = `${bounds.left}px`
  overlay.style.width = `${bounds.width}px`
  overlay.style.height = `${bounds.height}px`

  applyOverlayVisuals(overlay, kind)

  return overlay
}

/**
 * Draws overlays for the given bounds in a child frame. Calling this again
 * with the same `style.kind` replaces the overlays it previously drew.
 */
export function showChildOverlays(
  bounds: Bounds[],
  style: ChildOverlayStyle
): void {
  const { root } = getOverlayContainer(style.kind)

  root.replaceChildren(
    ...bounds.map((entry) => createOverlay(entry, style.kind))
  )
}

/**
 * Removes the overlays for the given `style.kind`, including its container,
 * from the document.
 */
export function clearChildOverlays(style: ChildOverlayStyle): void {
  const existing = containersByKind.get(style.kind)

  if (!existing) {
    return
  }

  existing.container.remove()
  containersByKind.delete(style.kind)
}
