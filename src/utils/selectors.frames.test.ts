import { describe, expect, it } from 'vitest'

import { LocatorOptions } from '@/schemas/locator'

import { findElementsByFrameChain } from './selectors'

const cssFrame = (selector: string): LocatorOptions => ({
  current: 'css',
  values: { css: { type: 'css', selector } },
})

function mountIframe(parent: Document, id: string, innerHtml: string): void {
  const iframe = parent.createElement('iframe')
  iframe.id = id
  parent.body.append(iframe)

  const doc = iframe.contentDocument

  if (doc === null) {
    throw new Error('iframe has no contentDocument')
  }

  doc.body.innerHTML = innerHtml
}

describe('findElementsByFrameChain', () => {
  it('resolves a locator in the top frame when there are no frames', () => {
    document.body.innerHTML = '<button>Top</button>'

    const matches = findElementsByFrameChain(
      document.documentElement,
      undefined,
      { type: 'css', selector: 'button' }
    )

    expect(matches).toHaveLength(1)
    expect(matches[0]?.textContent).toBe('Top')
  })

  it('resolves a locator inside a single iframe', () => {
    document.body.innerHTML = ''
    mountIframe(document, 'checkout', '<button>Pay</button>')

    const matches = findElementsByFrameChain(
      document.documentElement,
      [cssFrame('#checkout')],
      { type: 'css', selector: 'button' }
    )

    expect(matches).toHaveLength(1)
    expect(matches[0]?.textContent).toBe('Pay')
  })

  it('resolves a locator when the root is itself in a child realm (replay)', () => {
    // In session replay the root is the documentElement of the player's iframe,
    // a different realm than this module. Any iframe found under it belongs to
    // that realm, so a bare `instanceof HTMLIFrameElement` check would fail.
    document.body.innerHTML = ''

    const outer = document.createElement('iframe')
    document.body.append(outer)

    const replayDoc = outer.contentDocument

    if (replayDoc === null) {
      throw new Error('outer iframe has no contentDocument')
    }

    const checkout = replayDoc.createElement('iframe')
    checkout.id = 'checkout'
    replayDoc.body.append(checkout)

    const checkoutDoc = checkout.contentDocument

    if (checkoutDoc === null) {
      throw new Error('checkout iframe has no contentDocument')
    }

    checkoutDoc.body.innerHTML = '<button>Pay</button>'

    const matches = findElementsByFrameChain(
      replayDoc.documentElement,
      [cssFrame('#checkout')],
      { type: 'css', selector: 'button' }
    )

    expect(matches).toHaveLength(1)
    expect(matches[0]?.textContent).toBe('Pay')
  })

  it('returns nothing when a frame in the chain is missing', () => {
    document.body.innerHTML = '<button>Top</button>'

    const matches = findElementsByFrameChain(
      document.documentElement,
      [cssFrame('#does-not-exist')],
      { type: 'css', selector: 'button' }
    )

    expect(matches).toHaveLength(0)
  })
})
