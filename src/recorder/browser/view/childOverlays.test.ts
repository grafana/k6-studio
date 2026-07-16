import { afterEach, describe, expect, it } from 'vitest'

import { Bounds } from '@/components/Browser/types'

import {
  ChildOverlayStyle,
  clearChildOverlays,
  showChildOverlays,
} from './childOverlays'

const hoverStyle: ChildOverlayStyle = { kind: 'hover' }
const highlightStyle: ChildOverlayStyle = { kind: 'highlight' }

function makeBounds(overrides: Partial<Bounds> = {}): Bounds {
  return { top: 10, left: 20, width: 100, height: 50, ...overrides }
}

function getShadowContainers(): HTMLElement[] {
  return Array.from(document.body.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.shadowRoot !== null
  )
}

afterEach(() => {
  clearChildOverlays(hoverStyle)
  clearChildOverlays(highlightStyle)
})

describe('showChildOverlays', () => {
  it('creates a container appended to the body', () => {
    showChildOverlays([makeBounds()], hoverStyle)

    expect(getShadowContainers()).toHaveLength(1)
  })

  it('applies the bounds as fixed-position geometry styles', () => {
    showChildOverlays(
      [makeBounds({ top: 1, left: 2, width: 3, height: 4 })],
      hoverStyle
    )

    const [container] = getShadowContainers()
    const root = container?.shadowRoot?.firstElementChild
    const overlay = root?.firstElementChild as HTMLElement

    expect(overlay.style.position).toBe('fixed')
    expect(overlay.style.top).toBe('1px')
    expect(overlay.style.left).toBe('2px')
    expect(overlay.style.width).toBe('3px')
    expect(overlay.style.height).toBe('4px')
    expect(overlay.style.pointerEvents).toBe('none')
  })

  it('creates one overlay div per bounds entry', () => {
    showChildOverlays([makeBounds(), makeBounds(), makeBounds()], hoverStyle)

    const [container] = getShadowContainers()
    const root = container?.shadowRoot?.firstElementChild

    expect(root?.children).toHaveLength(3)
  })

  it('applies distinct visuals for hover and highlight kinds', () => {
    showChildOverlays([makeBounds()], hoverStyle)
    showChildOverlays([makeBounds()], highlightStyle)

    const [hoverContainer, highlightContainer] = getShadowContainers()

    const hoverOverlay = hoverContainer?.shadowRoot?.firstElementChild
      ?.firstElementChild as HTMLElement
    const highlightOverlay = highlightContainer?.shadowRoot?.firstElementChild
      ?.firstElementChild as HTMLElement

    expect(hoverOverlay.style.border).not.toBe('')
    expect(highlightOverlay.style.backgroundColor).not.toBe('')
    expect(hoverOverlay.style.border).not.toBe(highlightOverlay.style.border)
  })

  it('replaces the previous overlays for the same kind', () => {
    showChildOverlays([makeBounds(), makeBounds()], hoverStyle)
    showChildOverlays([makeBounds()], hoverStyle)

    expect(getShadowContainers()).toHaveLength(1)

    const [container] = getShadowContainers()
    const root = container?.shadowRoot?.firstElementChild

    expect(root?.children).toHaveLength(1)
  })

  it('keeps hover and highlight overlays independent of each other', () => {
    showChildOverlays([makeBounds(), makeBounds()], hoverStyle)
    showChildOverlays([makeBounds()], highlightStyle)

    expect(getShadowContainers()).toHaveLength(2)

    showChildOverlays([makeBounds(), makeBounds(), makeBounds()], hoverStyle)

    expect(getShadowContainers()).toHaveLength(2)

    const highlightContainer = getShadowContainers().find(
      (container) =>
        container.shadowRoot?.firstElementChild?.children.length === 1
    )

    expect(highlightContainer).toBeDefined()
  })

  it('marks the shadow root content with the Studio UI marker', () => {
    showChildOverlays([makeBounds()], hoverStyle)

    const [container] = getShadowContainers()
    const root = container?.shadowRoot?.firstElementChild as HTMLElement

    expect(root.dataset.ksixStudio).toBe('true')
  })

  it('keeps overlay boxes out of light-DOM queries used by selector generation', () => {
    // Selector generation (src/utils/dom/selectors.ts) walks the light DOM
    // via `document.body.querySelectorAll` and `finder`, neither of which
    // descends into shadow roots. Only the single container host may appear
    // in that traversal; the overlay boxes themselves must stay invisible.
    showChildOverlays([makeBounds(), makeBounds(), makeBounds()], hoverStyle)

    const lightDomDivs = document.body.querySelectorAll('div')

    expect(lightDomDivs).toHaveLength(1)
    expect(lightDomDivs[0]?.shadowRoot).not.toBeNull()
  })
})

describe('clearChildOverlays', () => {
  it('removes the container entirely from the document', () => {
    showChildOverlays([makeBounds()], hoverStyle)

    clearChildOverlays(hoverStyle)

    expect(getShadowContainers()).toHaveLength(0)
  })

  it('only clears the overlays for the given kind', () => {
    showChildOverlays([makeBounds()], hoverStyle)
    showChildOverlays([makeBounds()], highlightStyle)

    clearChildOverlays(hoverStyle)

    expect(getShadowContainers()).toHaveLength(1)
  })

  it('does not throw when there is nothing to clear', () => {
    expect(() => clearChildOverlays(hoverStyle)).not.toThrow()
  })
})
