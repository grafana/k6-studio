import { describe, expect, it } from 'vitest'

import { LocatorToBeCheckedAction } from '@/schemas/browserTest'
import { buildClickAction } from '@/test/factories/browserActions'

import { convertActionsToTest, convertEventsToTest } from './test'

describe('convertEventsToTest', () => {
  it('should not wait for navigation when submit-form is not followed by an implicit navigation', () => {
    const test = convertEventsToTest({
      browserEvents: [
        {
          type: 'navigate-to-page',
          eventId: 'start-nav',
          timestamp: 1,
          tab: 'tab-1',
          url: 'https://example.com/search',
          source: 'address-bar',
        },
        {
          type: 'submit-form',
          eventId: 'submit',
          timestamp: 2,
          tab: 'tab-1',
          form: { selectors: { css: 'form.search' } },
          submitter: { selectors: { css: 'button[type="submit"]' } },
        },
      ],
    })

    const submitNode = test.defaultScenario?.nodes
      .filter((node) => node.type === 'click')
      .find((node) => node.nodeId === 'submit')

    expect(submitNode).toBeDefined()
    expect(submitNode?.waitForNavigation).toBeUndefined()
  })

  it('should wait for navigation when submit-form is followed by an implicit navigation', () => {
    const test = convertEventsToTest({
      browserEvents: [
        {
          type: 'navigate-to-page',
          eventId: 'start-nav',
          timestamp: 1,
          tab: 'tab-1',
          url: 'https://example.com/search',
          source: 'address-bar',
        },
        {
          type: 'submit-form',
          eventId: 'submit',
          timestamp: 2,
          tab: 'tab-1',
          form: { selectors: { css: 'form.search' } },
          submitter: { selectors: { css: 'button[type="submit"]' } },
        },
        {
          type: 'navigate-to-page',
          eventId: 'implicit-nav',
          timestamp: 3,
          tab: 'tab-1',
          url: 'https://example.com/results',
          source: 'implicit',
        },
      ],
    })

    const nodes = test.defaultScenario?.nodes ?? []

    const submitNode = nodes
      .filter((node) => node.type === 'click')
      .find((node) => node.nodeId === 'submit')

    const implicitNavNode = nodes.find((node) => node.nodeId === 'implicit-nav')

    expect(implicitNavNode).toBeUndefined()

    expect(submitNode).toBeDefined()
    expect(submitNode?.waitForNavigation).toEqual({
      page: {
        nodeId: 'tab-1',
      },
    })
  })
})

describe('convertActionsToTest', () => {
  it('defaults to a left click when no options are set', () => {
    const test = convertActionsToTest({
      browserActions: [buildClickAction({ options: undefined })],
    })

    const click = test.defaultScenario?.nodes.find(
      (node) => node.type === 'click'
    )
    expect(click?.button).toBe('left')
  })

  it('reads options.button so middle and right clicks reach the IR', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildClickAction({ options: { button: 'right' } }),
        buildClickAction({ options: { button: 'middle' } }),
      ],
    })

    const clicks =
      test.defaultScenario?.nodes.filter((node) => node.type === 'click') ?? []
    expect(clicks.map((c) => c.button)).toEqual(['right', 'middle'])
  })

  it('translates options.modifiers into the IR modifier flags', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildClickAction({
          options: { button: 'left', modifiers: ['Control', 'Shift'] },
        }),
      ],
    })

    const click = test.defaultScenario?.nodes.find(
      (node) => node.type === 'click'
    )
    expect(click?.modifiers).toEqual({
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
    })
  })

  it('does not wait for navigation when click options omit waitForNavigation', () => {
    const test = convertActionsToTest({
      browserActions: [buildClickAction({ options: undefined })],
    })

    const clickNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'click'
    )

    expect(clickNode).toBeDefined()
    expect(clickNode?.waitForNavigation).toBeUndefined()
  })

  it('waits for navigation when click options.waitForNavigation is true', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildClickAction({ options: { waitForNavigation: true } }),
      ],
    })

    const nodes = test.defaultScenario?.nodes ?? []
    const pageNode = nodes.find((node) => node.type === 'page')
    const clickNode = nodes.find((node) => node.type === 'click')

    expect(pageNode).toBeDefined()
    expect(clickNode?.waitForNavigation).toEqual({
      page: { nodeId: pageNode?.nodeId },
    })
  })

  it('does not wait for navigation when click options.waitForNavigation is false', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildClickAction({ options: { waitForNavigation: false } }),
      ],
    })

    const clickNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'click'
    )

    expect(clickNode?.waitForNavigation).toBeUndefined()
  })

  it('threads inputType through toBeChecked action to is-checked IR operation', () => {
    const action: LocatorToBeCheckedAction = {
      id: 'assert-1',
      method: 'locator.toBeChecked',
      checked: true,
      inputType: 'aria',
      locator: {
        current: 'css',
        values: { css: { type: 'css', selector: '[role="checkbox"]' } },
      },
    }

    const test = convertActionsToTest({ browserActions: [action] })

    const assertNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'assert'
    )

    expect(assertNode).toBeDefined()
    expect(assertNode?.operation).toMatchObject({
      type: 'is-checked',
      inputType: 'aria',
      expected: 'checked',
    })
  })

  it('defaults inputType to native when threading toBeChecked action through to IR', () => {
    const action: LocatorToBeCheckedAction = {
      id: 'assert-1',
      method: 'locator.toBeChecked',
      checked: false,
      inputType: 'native',
      locator: {
        current: 'css',
        values: { css: { type: 'css', selector: 'input[type="checkbox"]' } },
      },
    }

    const test = convertActionsToTest({ browserActions: [action] })

    const assertNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'assert'
    )

    expect(assertNode?.operation).toMatchObject({
      type: 'is-checked',
      inputType: 'native',
      expected: 'unchecked',
    })
  })
})
