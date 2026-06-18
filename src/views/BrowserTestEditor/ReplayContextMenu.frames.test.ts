import { describe, expect, it } from 'vitest'

import { buildFrameChainFromElement } from './ReplayContextMenu.utils'

describe('buildFrameChainFromElement', () => {
  it('returns undefined for an element in the top document', () => {
    document.body.innerHTML = '<button>Top</button>'
    const button = document.querySelector('button')

    expect(button).not.toBeNull()
    expect(buildFrameChainFromElement(button as Element)).toBeUndefined()
  })

  // The inclusion path (collecting recorded-page iframes while excluding the
  // player's own iframe) relies on cross-realm window identity and selector
  // generation that jsdom can't reproduce, so it is covered by the end-to-end
  // verification instead.
})
