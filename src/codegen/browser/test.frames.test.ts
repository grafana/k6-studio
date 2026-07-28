import { describe, expect, it } from 'vitest'

import { elementLocatorOptions, frameLocatorOptions } from '@/schemas/locator'
import { BrowserEvent } from '@/schemas/recording'
import { buildClickAction } from '@/test/factories/browserActions'

import { convertEventsToActions } from './convertEventsToActions'
import { convertActionsToTest } from './test'

describe('frame chain conversion', () => {
  it('threads frames onto the locator node', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildClickAction({
          locator: elementLocatorOptions(
            { type: 'css', selector: 'button' },
            frameLocatorOptions({ type: 'css', selector: 'iframe#a' })
          ),
        }),
      ],
    })

    const locatorNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'locator'
    )

    expect(locatorNode?.frames).toEqual([{ type: 'css', selector: 'iframe#a' }])
  })

  it('converts event.frame to action.locator.parent', () => {
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
      locator: {
        parent: { current: 'css', values: { css: { selector: 'iframe#a' } } },
      },
    })
  })

  it('nests a multi-frame chain innermost-first, outermost frame last', () => {
    const events: BrowserEvent[] = [
      {
        type: 'click',
        eventId: '1',
        timestamp: 0,
        tab: 't',
        target: { selectors: { css: 'button' } },
        button: 'left',
        modifiers: { ctrl: false, shift: false, alt: false, meta: false },
        // Outermost first, per BrowserEvent's `frames` convention.
        frames: [
          { selectors: { css: 'iframe#outer' } },
          { selectors: { css: 'iframe#inner' } },
        ],
      },
    ]

    const actions = convertEventsToActions(events)

    expect(actions[0]).toMatchObject({
      method: 'locator.click',
      locator: {
        parent: {
          values: { css: { selector: 'iframe#inner' } },
          parent: {
            values: { css: { selector: 'iframe#outer' } },
            parent: undefined,
          },
        },
      },
    })
  })
})
