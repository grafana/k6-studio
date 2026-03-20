import { describe, expect, it } from 'vitest'

import { BrowserEvent, BrowserEventTarget } from '@/schemas/recording'

import { convertEventsToTest } from './test'

const formTarget: BrowserEventTarget = {
  selectors: {
    css: 'form.search',
  },
}

const submitterTarget: BrowserEventTarget = {
  selectors: {
    css: 'button[type="submit"]',
  },
}

function createSubmitFormEvents(
  withImplicitNavigation: boolean
): BrowserEvent[] {
  const events: BrowserEvent[] = [
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
      form: formTarget,
      submitter: submitterTarget,
    },
  ]

  if (withImplicitNavigation) {
    events.push({
      type: 'navigate-to-page',
      eventId: 'implicit-nav',
      timestamp: 3,
      tab: 'tab-1',
      url: 'https://example.com/results',
      source: 'implicit',
    })
  }

  return events
}

describe('convertEventsToTest submit-form navigation handling', () => {
  it('does not wait for navigation when submit-form has no implicit navigation event', () => {
    const test = convertEventsToTest({
      browserEvents: createSubmitFormEvents(false),
    })
    const submitNode = test.defaultScenario.nodes.find(
      (node) => node.nodeId === 'submit'
    )

    if (submitNode?.type !== 'click') {
      throw new Error('Expected submit event to convert to a click node')
    }

    expect(submitNode.waitForNavigation).toBeUndefined()
  })

  it('waits for navigation when submit-form is followed by implicit navigation', () => {
    const test = convertEventsToTest({
      browserEvents: createSubmitFormEvents(true),
    })
    const submitNode = test.defaultScenario.nodes.find(
      (node) => node.nodeId === 'submit'
    )

    if (submitNode?.type !== 'click') {
      throw new Error('Expected submit event to convert to a click node')
    }

    expect(submitNode.waitForNavigation).toEqual({
      page: {
        nodeId: 'tab-1',
      },
    })
    expect(
      test.defaultScenario.nodes.some((node) => node.nodeId === 'implicit-nav')
    ).toBe(false)
  })
})
