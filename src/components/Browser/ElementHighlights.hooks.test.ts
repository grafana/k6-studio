import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useHighlightedElements } from './ElementHighlights.hooks'

// In session replay a clicked element can live inside a nested iframe, i.e. a
// different realm than the player root. Passed directly as the highlight target,
// it must still be recognised as an element and highlighted.
function childRealm(): Document {
  const iframe = document.createElement('iframe')
  document.body.append(iframe)

  const doc = iframe.contentDocument

  if (doc === null) {
    throw new Error('iframe has no contentDocument')
  }

  return doc
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useHighlightedElements', () => {
  it('highlights a cross-realm element passed as the target', async () => {
    const doc = childRealm()
    doc.body.innerHTML = '<button>Pay</button>'

    const target = doc.querySelector('button')

    if (target === null) {
      throw new Error('button not found')
    }

    // The target is from the iframe's realm, so `instanceof Element` is false.
    expect(target instanceof Element).toBe(false)

    const { result } = renderHook(() =>
      useHighlightedElements(document.documentElement, target)
    )

    await waitFor(() => {
      expect(result.current).toHaveLength(1)
    })

    expect(result.current?.[0]?.element).toBe(target)
  })
})
