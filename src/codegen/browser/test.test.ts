import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildClickAction,
  buildToBeCheckedAction,
} from '@/test/factories/browserActions'
import { SyntheticKey } from '@/utils/zod'

import { convertActionsToTest } from './test'
import { TestNode } from './types'

// A fixed stand-in key: these fixtures don't exercise key behavior, and
// generating one via newSyntheticKey() would consume the mocked
// crypto.randomUUID() counter that convertActionsToTest's node IDs rely on.
const fixtureKey = 'fixture-key' as SyntheticKey

describe('convertActionsToTest', () => {
  beforeEach(() => {
    let counter = 0

    vi.stubGlobal('crypto', {
      randomUUID: () => `${counter++}`,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

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

  it('adds trace nodes for pages and locators, and connects them to the correct previous nodes', () => {
    const test = convertActionsToTest({
      browserActions: [
        { method: 'page.goto', id: '1', url: 'https://example.com' },
        {
          method: 'locator.click',
          id: '2',
          locator: {
            type: 'element',
            key: fixtureKey,
            current: 'css',
            values: {
              css: {
                type: 'css',
                selector: 'button#submit',
              },
            },
          },
        },
      ],
      trace: true,
    })

    const nodes = test.defaultScenario?.nodes ?? []

    expect(nodes).toEqual([
      {
        type: 'page',
        nodeId: '1',
      },
      {
        type: 'trace',
        nodeId: '2',
        traceId: '1',
        inputs: {
          previous: {
            nodeId: '1',
          },
        },
      },
      {
        type: 'goto',
        nodeId: '0',
        url: 'https://example.com',
        source: 'address-bar',
        inputs: {
          page: {
            nodeId: '2',
          },
        },
      },
      {
        type: 'locator',
        nodeId: '4',
        locator: {
          type: 'css',
          selector: 'button#submit',
        },
        frames: [],
        inputs: {
          page: {
            nodeId: '1',
          },
        },
      },
      {
        type: 'trace',
        nodeId: '5',
        traceId: '2',
        inputs: {
          previous: {
            nodeId: '4',
          },
        },
      },
      {
        type: 'click',
        nodeId: '3',
        button: 'left',
        modifiers: {
          alt: false,
          ctrl: false,
          meta: false,
          shift: false,
        },
        inputs: {
          locator: {
            nodeId: '5',
          },
        },
      },
    ] satisfies TestNode[])
  })

  it('threads inputType:aria through toBeChecked to is-checked IR operation', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildToBeCheckedAction({
          inputType: 'aria',
          checked: true,
          locator: {
            type: 'element',
            key: fixtureKey,
            current: 'css',
            values: { css: { type: 'css', selector: '[role="checkbox"]' } },
          },
        }),
      ],
    })

    const assertNode = test.defaultScenario?.nodes.find(
      (node) => node.type === 'assert'
    )

    expect(assertNode?.operation).toMatchObject({
      type: 'is-checked',
      inputType: 'aria',
      expected: 'checked',
    })
  })

  it('threads inputType:native through toBeChecked to is-checked IR operation', () => {
    const test = convertActionsToTest({
      browserActions: [
        buildToBeCheckedAction({ inputType: 'native', checked: false }),
      ],
    })

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
