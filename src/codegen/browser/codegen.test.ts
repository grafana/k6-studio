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

it('should emit click event on element', async ({ expect }) => {
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
