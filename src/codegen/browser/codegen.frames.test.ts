import { afterAll, beforeAll, it, vi } from 'vitest'

import { ElementLocator } from '@/schemas/locator'

import { emitScript } from './codegen'
import { Scenario } from './types'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2023-10-01T00:00:00Z'))
})

afterAll(() => {
  vi.useRealTimers()
})

const noModifiers = { ctrl: false, shift: false, alt: false, meta: false }

function clickScenario(
  frames: ElementLocator[],
  element: ElementLocator
): Scenario {
  return {
    nodes: [
      { type: 'page', nodeId: 'page' },
      {
        type: 'locator',
        nodeId: 'loc',
        locator: element,
        frames,
        inputs: { page: { nodeId: 'page' } },
      },
      {
        type: 'click',
        nodeId: 'click',
        button: 'left',
        modifiers: noModifiers,
        inputs: { locator: { nodeId: 'loc' } },
      },
    ],
  }
}

const strip = (value: string) => value.replace(/\s/g, '')

it('wraps a click in a single iframe with frameLocator', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: clickScenario([{ type: 'css', selector: 'iframe#app' }], {
      type: 'css',
      selector: 'button',
    }),
    scenarios: {},
  })

  expect(strip(script)).toContain(
    'page.frameLocator("iframe#app").locator("button").click()'
  )
})

it('chains frameLocator for nested iframes', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: clickScenario(
      [
        { type: 'css', selector: '#outer' },
        { type: 'css', selector: '#inner' },
      ],
      { type: 'css', selector: 'button' }
    ),
    scenarios: {},
  })

  expect(strip(script)).toContain(
    'page.frameLocator("#outer").frameLocator("#inner").locator("button").click()'
  )
})

it('creates non-css element locators on the frame', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: clickScenario(
      [{ type: 'css', selector: 'iframe#checkout' }],
      {
        type: 'role',
        role: 'button',
        options: { name: 'Pay' },
      }
    ),
    scenarios: {},
  })

  expect(strip(script)).toContain(
    'page.frameLocator("iframe#checkout").getByRole("button",{name:"Pay"}).click()'
  )
})

it('uses contentFrame for a non-css frame locator', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: clickScenario([{ type: 'title', title: 'Ad' }], {
      type: 'css',
      selector: 'button',
    }),
    scenarios: {},
  })

  expect(strip(script)).toContain(
    'page.getByTitle("Ad").contentFrame().locator("button").click()'
  )
})

it('matches the full nested-iframe snapshot', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: clickScenario(
      [
        { type: 'css', selector: 'iframe#outer' },
        { type: 'css', selector: 'iframe#inner' },
      ],
      { type: 'css', selector: 'button.pay' }
    ),
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/click-element-in-nested-iframe.ts'
  )
})
