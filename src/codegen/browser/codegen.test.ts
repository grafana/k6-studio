import { afterAll, beforeAll, it, vi } from 'vitest'

import { emitScript } from './codegen'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2023-10-01T00:00:00Z'))
})

afterAll(() => {
  vi.useRealTimers()
})

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

it('should emit type text on element', async ({ expect }) => {
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
          selector: 'input',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'type-text',
          nodeId: 'type-text',
          value: 'Hello, World!',
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/type-text-on-element.ts'
  )
})

it('should emit check on element', async ({ expect }) => {
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
          selector: 'input[type="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'check',
          nodeId: 'check',
          checked: true,
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/check-element.ts'
  )
})

it('should emit uncheck on element', async ({ expect }) => {
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
          selector: 'input[type="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'check',
          nodeId: 'check',
          checked: false,
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/uncheck-element.ts'
  )
})

it('should emit select single option on element', async ({ expect }) => {
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
          selector: 'select',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'select-options',
          nodeId: 'select-options',
          selected: ['option1'],
          multiple: false,
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/select-single-option-on-element.ts'
  )
})

it('should emit select with multiple options on element', async ({
  expect,
}) => {
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
          selector: 'select',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'select-options',
          nodeId: 'select-options',
          selected: ['option1', 'option2'],
          multiple: true,
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/select-multiple-options-on-element.ts'
  )
})

it('should assert that element contains text', async ({ expect }) => {
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
          type: 'assert',
          nodeId: 'assert-contains-text',
          operation: {
            type: 'text-contains',
            value: 'Hello, World!',
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
    '__snapshots__/browser/assertions/element-contains-text.ts'
  )
})

it('should assert that element is visible', async ({ expect }) => {
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
          type: 'assert',
          nodeId: 'assert-is-visible',
          operation: {
            type: 'is-visible',
            visible: true,
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
    '__snapshots__/browser/assertions/element-is-visible.ts'
  )
})

it('should assert that element is hidden', async ({ expect }) => {
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
          type: 'assert',
          nodeId: 'assert-is-hidden',
          operation: {
            type: 'is-visible',
            visible: false,
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
    '__snapshots__/browser/assertions/element-is-hidden.ts'
  )
})

it('should assert that html input is checked', async ({ expect }) => {
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
          selector: 'input[type="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'html',
            expected: 'checked',
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
    '__snapshots__/browser/assertions/input/checkbox/input-is-checked.ts'
  )
})

it('should assert that html input is not checked', async ({ expect }) => {
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
          selector: 'input[type="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'html',
            expected: 'unchecked',
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
    '__snapshots__/browser/assertions/input/checkbox/input-is-not-checked.ts'
  )
})

it('should assert that html input is indeterminate', async ({ expect }) => {
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
          selector: 'input[type="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'html',
            expected: 'indeterminate',
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
    '__snapshots__/browser/assertions/input/checkbox/input-is-indeterminate.ts'
  )
})

it('should assert that aria input is checked', async ({ expect }) => {
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
          selector: '[role="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'aria',
            expected: 'checked',
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
    '__snapshots__/browser/assertions/input/checkbox/aria-input-is-checked.ts'
  )
})

it('should assert that aria input is not checked', async ({ expect }) => {
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
          selector: '[role="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'aria',
            expected: 'unchecked',
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
    '__snapshots__/browser/assertions/input/checkbox/aria-input-is-not-checked.ts'
  )
})

it('should assert that aria input is indeterminate', async ({ expect }) => {
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
          selector: '[role="checkbox"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'aria',
            expected: 'indeterminate',
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
    '__snapshots__/browser/assertions/input/checkbox/aria-input-is-indeterminate.ts'
  )
})

it('should assert that input has single value using toHaveValue', async ({
  expect,
}) => {
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
          selector: 'input[type="text"]',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-has-value',
          operation: {
            type: 'has-values',
            expected: ['value1'],
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
    '__snapshots__/browser/assertions/input/input-has-single-value.ts'
  )
})

it('should assert that input has multiple values using toHaveValues', async ({
  expect,
}) => {
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
          selector: 'select',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-has-value',
          operation: {
            type: 'has-values',
            expected: ['value1', 'value2'],
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
    '__snapshots__/browser/assertions/input/input-has-multiple-values.ts'
  )
})
