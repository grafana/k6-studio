import { afterEach, describe, expect, it } from 'vitest'

import { useInBrowserUIStore } from './store'
import { shouldSkipEvent } from './utils'

afterEach(() => {
  delete window.__K6_STUDIO_INSPECTION__
  delete window.__K6_STUDIO_TEXT_SELECTION__
  useInBrowserUIStore.getState().selectTool(null)
})

describe('shouldSkipEvent', () => {
  it('does not skip events when no tool is active', () => {
    expect(shouldSkipEvent(new Event('click'))).toBe(false)
  })

  it('skips events while the top frame has the inspector active', () => {
    // A child frame has its own store where `tool` stays null, so it must look
    // at the top frame's inspector bridge instead of its local store.
    window.__K6_STUDIO_INSPECTION__ = { hover: () => {}, pick: () => {} }

    expect(useInBrowserUIStore.getState().tool).toBeNull()
    expect(shouldSkipEvent(new Event('click'))).toBe(true)
  })

  it('skips events while the top frame has text selection active', () => {
    window.__K6_STUDIO_TEXT_SELECTION__ = { select: () => {} }

    expect(shouldSkipEvent(new Event('click'))).toBe(true)
  })
})
