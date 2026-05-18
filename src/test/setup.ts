import { cleanup } from '@testing-library/react'
import { enableMapSet } from 'immer'
import { afterEach, vi } from 'vitest'

enableMapSet()

vi.mock('electron-log/main', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

vi.mock('electron-log/renderer', () => ({
  default: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver
}

if (typeof Element !== 'undefined' && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

if (
  typeof HTMLElement !== 'undefined' &&
  !HTMLElement.prototype.hasPointerCapture
) {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false)
  HTMLElement.prototype.releasePointerCapture = vi.fn()
}

if (typeof window !== 'undefined') {
  // jsdom logs "Not implemented: window.getComputedStyle(elt, pseudoElt)" when
  // pseudo-element styles are requested (e.g. by Playwright's injectedScript
  // role-queries). The underlying call still returns the element's computed
  // style, so dropping the pseudo argument is equivalent and avoids the noise.
  const originalGetComputedStyle = window.getComputedStyle.bind(window)
  window.getComputedStyle = ((element: Element) =>
    originalGetComputedStyle(element)) as typeof window.getComputedStyle
}

afterEach(() => {
  cleanup()
})
