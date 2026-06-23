import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  attachIframeReloadListeners,
  attachInteractionListeners,
  collectReplayDocuments,
  getReplayClickPosition,
} from './SessionPlayer.interaction'

function mockRect(element: Element, rect: Partial<DOMRect>): void {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('collectReplayDocuments', () => {
  it('returns the root document on its own when there are no iframes', () => {
    document.body.innerHTML = '<div>top</div>'

    expect(collectReplayDocuments(document)).toEqual([document])
  })

  it('includes nested iframe documents so clicks inside them can be handled', () => {
    document.body.innerHTML = ''
    const iframe = document.createElement('iframe')
    document.body.append(iframe)

    const nested = iframe.contentDocument

    if (nested === null) {
      throw new Error('iframe has no contentDocument')
    }

    const documents = collectReplayDocuments(document)

    expect(documents).toContain(document)
    expect(documents).toContain(nested)
  })
})

describe('getReplayClickPosition', () => {
  it('maps a top-frame click through the player scaling', () => {
    const player = document.createElement('iframe')
    document.body.append(player)

    const doc = player.contentDocument

    if (doc === null) {
      throw new Error('player iframe has no contentDocument')
    }

    doc.body.innerHTML = '<button>click</button>'

    const target = doc.querySelector('button')

    if (target === null) {
      throw new Error('button not found')
    }

    mockRect(player, { left: 10, top: 20, width: 200, height: 400 })
    Object.defineProperty(player, 'offsetWidth', {
      value: 100,
      configurable: true,
    })
    Object.defineProperty(player, 'offsetHeight', {
      value: 50,
      configurable: true,
    })

    // x = 10 + (50 / 100) * 200, y = 20 + (25 / 50) * 400
    const position = getReplayClickPosition(target, player, 50, 25)

    expect(position.x).toBeCloseTo(110)
    expect(position.y).toBeCloseTo(220)
  })

  it('adds nested iframe offsets before scaling', () => {
    const player = document.createElement('iframe')
    document.body.append(player)

    const replayDoc = player.contentDocument

    if (replayDoc === null) {
      throw new Error('player iframe has no contentDocument')
    }

    const nested = replayDoc.createElement('iframe')
    replayDoc.body.append(nested)

    const nestedDoc = nested.contentDocument

    if (nestedDoc === null) {
      throw new Error('nested iframe has no contentDocument')
    }

    nestedDoc.body.innerHTML = '<button>click</button>'

    const target = nestedDoc.querySelector('button')

    if (target === null) {
      throw new Error('button not found')
    }

    mockRect(player, { left: 0, top: 0, width: 100, height: 100 })
    Object.defineProperty(player, 'offsetWidth', {
      value: 100,
      configurable: true,
    })
    Object.defineProperty(player, 'offsetHeight', {
      value: 100,
      configurable: true,
    })
    mockRect(nested, { left: 5, top: 7 })

    // The nested iframe offset (5, 7) is added to the click before scaling 1:1.
    const position = getReplayClickPosition(target, player, 50, 25)

    expect(position.x).toBeCloseTo(55)
    expect(position.y).toBeCloseTo(32)
  })
})

describe('attachIframeReloadListeners', () => {
  it('calls back when a collected iframe loads', () => {
    document.body.innerHTML = '<iframe></iframe><iframe></iframe>'
    const iframes = [...document.querySelectorAll('iframe')]
    const onReload = vi.fn()

    const cleanup = attachIframeReloadListeners([document], onReload)

    iframes[0]?.dispatchEvent(new Event('load'))
    iframes[1]?.dispatchEvent(new Event('load'))

    expect(onReload).toHaveBeenCalledTimes(2)

    cleanup()
  })

  it('stops calling back after cleanup', () => {
    document.body.innerHTML = '<iframe></iframe>'
    const [iframe] = document.querySelectorAll('iframe')
    const onReload = vi.fn()

    const cleanup = attachIframeReloadListeners([document], onReload)
    cleanup()

    iframe?.dispatchEvent(new Event('load'))

    expect(onReload).not.toHaveBeenCalled()
  })
})

describe('attachInteractionListeners', () => {
  it('forwards clicks from a document to onClick', () => {
    document.body.innerHTML = '<button id="b">x</button>'
    const onClick = vi.fn()

    const cleanup = attachInteractionListeners([document], {
      onClick,
      onReload: vi.fn(),
    })

    document
      .getElementById('b')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onClick).toHaveBeenCalledTimes(1)

    cleanup()
  })

  it('blocks navigation-causing events', () => {
    document.body.innerHTML = '<button id="b">x</button>'

    const cleanup = attachInteractionListeners([document], {
      onClick: vi.fn(),
      onReload: vi.fn(),
    })

    const event = new Event('keydown', { bubbles: true, cancelable: true })
    document.getElementById('b')?.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)

    cleanup()
  })

  it('blocks default navigation on click while still forwarding it', () => {
    document.body.innerHTML = '<a id="link" href="#x">x</a>'
    const onClick = vi.fn()

    const cleanup = attachInteractionListeners([document], {
      onClick,
      onReload: vi.fn(),
    })

    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    document.getElementById('link')?.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(onClick).toHaveBeenCalledTimes(1)

    cleanup()
  })

  it('reattaches when a collected iframe loads', () => {
    document.body.innerHTML = '<iframe></iframe>'
    const [iframe] = document.querySelectorAll('iframe')
    const onReload = vi.fn()

    const cleanup = attachInteractionListeners([document], {
      onClick: vi.fn(),
      onReload,
    })

    iframe?.dispatchEvent(new Event('load'))

    expect(onReload).toHaveBeenCalledTimes(1)

    cleanup()
  })

  it('stops forwarding clicks after cleanup', () => {
    document.body.innerHTML = '<button id="b">x</button>'
    const onClick = vi.fn()

    const cleanup = attachInteractionListeners([document], {
      onClick,
      onReload: vi.fn(),
    })
    cleanup()

    document
      .getElementById('b')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(onClick).not.toHaveBeenCalled()
  })
})
