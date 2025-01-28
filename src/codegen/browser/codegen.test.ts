import { it } from 'vitest'
import { emitScript } from './codegen'

it('should emit an empty test with browser scenario options', async ({
  expect,
}) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/empty-browser-test.ts'
  )
})

it('should goto a url', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
        {
          type: 'goto',
          nodeId: 'goto',
          url: 'https://example.com',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot('__snapshots__/browser/goto-url.ts')
})

it('should reload the page', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
        {
          type: 'reload',
          nodeId: 'reload',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/reload-page.ts'
  )
})

it('should emit click on element', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
        {
          type: 'locator',
          nodeId: 'locator',
          selector: 'button',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          nodeId: 'click',
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/click-element.ts'
  )
})

it('should emit right-click on element', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
        {
          type: 'locator',
          nodeId: 'locator',
          selector: 'button',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          nodeId: 'click',
          button: 'right',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/right-click-element.ts'
  )
})

it('should emit click with modifier keys on element', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
        {
          type: 'locator',
          nodeId: 'locator',
          selector: 'button',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          nodeId: 'click',
          button: 'right',
          modifiers: {
            ctrl: true,
            shift: true,
            alt: true,
            meta: true,
          },
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/click-element-with-modifier-keys.ts'
  )
})
