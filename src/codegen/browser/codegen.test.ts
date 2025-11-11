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
          source: 'address-bar',
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
          selector: { type: 'css', selector: 'button' },
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
            page: { nodeId: 'page' },
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
          selector: { type: 'css', selector: 'button' },
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
            page: { nodeId: 'page' },
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
          selector: { type: 'css', selector: 'button' },
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
            page: { nodeId: 'page' },
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
          selector: { type: 'css', selector: 'input' },
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
          selector: { type: 'css', selector: 'input[type="checkbox"]' },
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
          selector: { type: 'css', selector: 'input[type="checkbox"]' },
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
          selector: { type: 'css', selector: 'select' },
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
          selector: { type: 'css', selector: 'select' },
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

it('should emit waitForNavigation on a link click', async ({ expect }) => {
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
          selector: { type: 'css', selector: 'button' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          button: 'left',
          nodeId: 'click',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
          triggersNavigation: true,
          inputs: {
            locator: { nodeId: 'locator' },
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'goto',
          nodeId: 'goto',
          source: 'implicit',
          url: 'https://example.com/login',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/click-with-navigation.ts'
  )
})

it('should emit waitForNavigation on a form submit', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
        {
          type: 'locator',
          nodeId: 'submitLocator',
          selector: { type: 'css', selector: 'button[type="submit"]' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          button: 'left',
          nodeId: 'submitClick',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
          triggersNavigation: true,
          inputs: {
            locator: { nodeId: 'submitLocator' },
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'goto',
          nodeId: 'goto',
          source: 'implicit',
          url: 'https://example.com',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/form-submit-with-navigation.ts'
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
          selector: { type: 'css', selector: 'button' },
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
          selector: { type: 'css', selector: 'button' },
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
          selector: { type: 'css', selector: 'button' },
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
          selector: { type: 'css', selector: 'input[type="checkbox"]' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'native',
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
          selector: { type: 'css', selector: 'input[type="checkbox"]' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'native',
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
          selector: { type: 'css', selector: 'input[type="checkbox"]' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'assert',
          nodeId: 'assert-is-checked',
          operation: {
            type: 'is-checked',
            inputType: 'native',
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
          selector: { type: 'css', selector: '[role="checkbox"]' },
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
          selector: { type: 'css', selector: '[role="checkbox"]' },
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
          selector: { type: 'css', selector: '[role="checkbox"]' },
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
          selector: { type: 'css', selector: 'input[type="text"]' },
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
    '__snapshots__/browser/assertions/input/text-input-has-value.ts'
  )
})

it('should emit a getByTestId locator', async ({ expect }) => {
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
          selector: { type: 'test-id', testId: 'submit-button' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          nodeId: 'click',
          inputs: {
            locator: { nodeId: 'locator' },
            page: { nodeId: 'page' },
          },
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/get-by-test-id.ts'
  )
})

it('should emit a getByRole locator', async ({ expect }) => {
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
          selector: {
            type: 'role',
            role: 'button',
            name: 'Submit',
          },
          inputs: { page: { nodeId: 'page' } },
        },
        {
          type: 'click',
          nodeId: 'click',
          inputs: {
            locator: { nodeId: 'locator' },
            page: { nodeId: 'page' },
          },
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/get-by-role.ts'
  )
})

it('should emit a css locator', async ({ expect }) => {
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
          selector: {
            type: 'css',
            selector: 'button.submit-btn',
          },
          inputs: { page: { nodeId: 'page' } },
        },
        {
          type: 'click',
          nodeId: 'click',
          inputs: {
            locator: { nodeId: 'locator' },
            page: { nodeId: 'page' },
          },
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/css-locator.ts'
  )
})

it('should emit a getByAltText locator', async ({ expect }) => {
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
          selector: {
            type: 'alt',
            text: 'Grot is happy',
          },
          inputs: { page: { nodeId: 'page' } },
        },
        {
          type: 'click',
          nodeId: 'click',
          inputs: {
            locator: { nodeId: 'locator' },
            page: { nodeId: 'page' },
          },
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/get-by-alt-text.ts'
  )
})

it('should emit a getByLabel locator', async ({ expect }) => {
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
          selector: {
            type: 'label',
            text: 'Username',
          },
          inputs: { page: { nodeId: 'page' } },
        },
        {
          type: 'type-text',
          nodeId: 'type-text',
          value: 'my-username',
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/get-by-label.ts'
  )
})

it('should emit a getByPlaceholder locator', async ({ expect }) => {
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
          selector: {
            type: 'placeholder',
            text: 'Enter your email',
          },
          inputs: { page: { nodeId: 'page' } },
        },
        {
          type: 'type-text',
          nodeId: 'type-text',
          value: 'test@example.com',
          inputs: {
            locator: { nodeId: 'locator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/get-by-placeholder.ts'
  )
})

it('should emit a getByTitle locator', async ({ expect }) => {
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
          selector: {
            type: 'title',
            text: 'Submit your form',
          },
          inputs: { page: { nodeId: 'page' } },
        },
        {
          type: 'click',
          nodeId: 'click',
          inputs: {
            locator: { nodeId: 'locator' },
            page: { nodeId: 'page' },
          },
          button: 'left',
          modifiers: {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/locators/get-by-title.ts'
  )
})
