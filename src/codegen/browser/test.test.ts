import { describe, expect, it } from 'vitest'

import { convertEventsToTest } from './test'

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
