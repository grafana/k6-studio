import { describe, expect, test } from 'vitest'

import { BrowserEventSchema } from './index'

describe('BrowserEventSchema frame path', () => {
  test('retains the frame chain on a click event', () => {
    const event = {
      type: 'click',
      eventId: '1',
      timestamp: 0,
      tab: 'tab1',
      target: { selectors: { css: 'button' } },
      button: 'left',
      modifiers: { ctrl: false, shift: false, alt: false, meta: false },
      frames: [
        { selectors: { css: 'iframe#outer' } },
        { selectors: { css: 'iframe#inner' } },
      ],
    }

    const result = BrowserEventSchema.parse(event)

    expect(result).toMatchObject({
      type: 'click',
      frames: [
        { selectors: { css: 'iframe#outer' } },
        { selectors: { css: 'iframe#inner' } },
      ],
    })
  })

  test('omits frame for top-frame events', () => {
    const event = {
      type: 'click',
      eventId: '1',
      timestamp: 0,
      tab: 'tab1',
      target: { selectors: { css: 'button' } },
      button: 'left',
      modifiers: { ctrl: false, shift: false, alt: false, meta: false },
    }

    const result = BrowserEventSchema.parse(event)

    if (result.type !== 'click') {
      throw new Error('expected a click event')
    }

    expect(result.frames).toBeUndefined()
  })

  test('does not carry a frame chain on page-level events', () => {
    const event = {
      type: 'navigate-to-page',
      eventId: '1',
      timestamp: 0,
      tab: 'tab1',
      url: 'http://example.test',
      source: 'address-bar',
      // A navigation has no element target, so it has no frame scope. The schema
      // should not retain frames here even if some upstream code attaches them.
      frames: [{ selectors: { css: 'iframe#outer' } }],
    }

    const result = BrowserEventSchema.parse(event)

    expect(result).not.toHaveProperty('frames')
  })
})
