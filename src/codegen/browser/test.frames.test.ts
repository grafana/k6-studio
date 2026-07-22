import { describe, expect, it } from 'vitest'

import { cssLocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { buildClickAction } from '@/test/factories/browserActions'

import { convertEventsToActions } from './convertEventsToActions'
import { convertActionsToTest, convertEventsToTest } from './test'

describe('frame chain conversion', () => {
  it('threads action.frames onto the locator node', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildClickAction({
          locator: cssLocatorOptions('button'),
          frames: [cssLocatorOptions('iframe#a')],
        }),
      ],
    })

    const locatorNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'locator'
    )

    expect(locatorNode?.frames).toEqual([{ type: 'css', selector: 'iframe#a' }])
  })

  it('threads event.frame onto the locator node', () => {
    const test = convertEventsToTest({
      browserEvents: [
        {
          type: 'click',
          eventId: '1',
          timestamp: 0,
          tab: 't',
          target: { selectors: { css: 'button' } },
          button: 'left',
          modifiers: { ctrl: false, shift: false, alt: false, meta: false },
          frames: [{ selectors: { css: 'iframe#a' } }],
        },
      ],
    })

    const locatorNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'locator'
    )

    expect(locatorNode?.frames).toEqual([{ type: 'css', selector: 'iframe#a' }])
  })

  it('converts event.frame to action.frames', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 't',
        target: { selectors: { css: 'button' } },
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
        frames: [{ selectors: { css: 'iframe#a' } }],
      },
    ]

    const actions = convertEventsToActions(events)

    expect(actions[0]).toMatchObject({
      method: 'locator.click',
      frames: [{ current: 'css', values: { css: { selector: 'iframe#a' } } }],
    })
  })
})
