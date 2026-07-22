import { afterEach, describe, expect, it } from 'vitest'

import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'

import { buildFramePath, getCssFramePathForElement, withFrames } from './frames'

interface FakeWindow {
  parent: FakeWindow
  frameElement: Element | null
}

function fakeFrame(frameElement: Element | null): FakeWindow {
  const win = { frameElement } as FakeWindow
  win.parent = win
  return win
}

const details = (element: Element): BrowserEventTarget => ({
  selectors: { css: (element as { id: string }).id },
})

describe('buildFramePath', () => {
  it('returns an empty path for the top frame', () => {
    const top = fakeFrame(null)

    expect(buildFramePath(top as unknown as Window, details)).toEqual([])
  })

  it('returns the iframe chain outermost first', () => {
    const top = fakeFrame(null)
    const middle = fakeFrame({ id: 'iframe#outer' } as unknown as Element)
    const leaf = fakeFrame({ id: 'iframe#inner' } as unknown as Element)

    middle.parent = top
    leaf.parent = middle

    expect(buildFramePath(leaf as unknown as Window, details)).toEqual([
      { selectors: { css: 'iframe#outer' } },
      { selectors: { css: 'iframe#inner' } },
    ])
  })

  it('throws when a frame in the chain has no reachable owning element', () => {
    const top = fakeFrame(null)
    const middle = fakeFrame(null)
    const leaf = fakeFrame({ id: 'iframe#inner' } as unknown as Element)

    middle.parent = top
    leaf.parent = middle

    // A partial path would resolve the locator in the wrong (shallower) frame,
    // so the walk fails and the caller falls back to no frame path instead.
    expect(() => buildFramePath(leaf as unknown as Window, details)).toThrow()
  })
})

describe('withFrames', () => {
  const event: BrowserEvent = {
    type: 'navigate-to-page',
    eventId: 'a',
    timestamp: 1,
    tab: 'tab-1',
    url: 'http://example.test',
    source: 'address-bar',
  }

  it('attaches the frame path when the event happened inside an iframe', () => {
    const frames: BrowserEventTarget[] = [{ selectors: { css: '#frame' } }]

    expect(withFrames(event, frames)).toEqual({ ...event, frames })
  })

  it('leaves a top-frame event untouched when the path is empty', () => {
    expect(withFrames(event, [])).toBe(event)
  })
})

describe('getCssFramePathForElement', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  // The iframe-traversal path can't be exercised under jsdom: an iframe's
  // contentWindow.parent self-references (so the frame walk can't ascend) and
  // `finder` needs CSS.escape, which jsdom lacks. It is verified in the running
  // app instead; here we cover the top-frame case.
  it('returns an empty path for a top-frame element', () => {
    document.body.innerHTML = '<button id="target">x</button>'

    const target = document.querySelector('#target')

    if (target === null) {
      throw new Error('target not found')
    }

    expect(getCssFramePathForElement(target)).toEqual([])
  })
})
