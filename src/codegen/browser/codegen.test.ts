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
          waitForNavigation: {
            page: { nodeId: 'page' },
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
    '__snapshots__/browser/click-with-navigation.ts'
  )
})

it('should keep page allocation block open for post-navigation interactions', async ({
  expect,
}) => {
  // Regression test: click with triggersNavigation calls context.reference(page)
  // but buildScenarioGraph does not connect click→page. Without the implicit goto
  // node that previously balanced this, the page ref count is wrong — the block
  // finalizes too early and page.close() runs before post-nav interactions.
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
          url: 'https://example.com/start',
          source: 'address-bar',
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'locator',
          nodeId: 'linkLocator',
          selector: { type: 'css', selector: 'a.nav-link' },
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
          waitForNavigation: {
            page: { nodeId: 'page' },
          },
          inputs: {
            locator: { nodeId: 'linkLocator' },
          },
        },
        {
          type: 'locator',
          nodeId: 'inputLocator',
          selector: { type: 'css', selector: 'input[name="query"]' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'type-text',
          nodeId: 'type-text',
          value: 'search term',
          inputs: {
            locator: { nodeId: 'inputLocator' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/click-navigate-then-interact.ts'
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
          waitForNavigation: {
            page: { nodeId: 'page' },
          },
          inputs: {
            locator: { nodeId: 'submitLocator' },
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

it('should emit a waitFor statement', async ({ expect }) => {
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
          type: 'wait-for',
          nodeId: 'wait-for',
          inputs: {
            locator: { nodeId: 'locator' },
          },
          options: {
            timeout: 5000,
            state: 'hidden',
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/wait-for-statement.ts'
  )
})

it('should emit merged try-finally blocks', async ({ expect }) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'first-page',
        },
        {
          type: 'goto',
          nodeId: 'reference-first-page',
          url: 'https://example.com',
          source: 'address-bar',
          inputs: {
            page: { nodeId: 'first-page' },
          },
        },
        {
          type: 'page',
          nodeId: 'second-page',
        },
        {
          type: 'goto',
          nodeId: 'reference-second-page',
          url: 'https://example.com',
          source: 'address-bar',
          inputs: {
            page: { nodeId: 'second-page' },
          },
        },
        {
          type: 'goto',
          nodeId: 'reference-first-page-again',
          url: 'https://example2.com',
          source: 'address-bar',
          inputs: {
            page: { nodeId: 'first-page' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/merged-try-finally-blocks.ts'
  )
})

it('should emit two disjoint try-finally blocks', async ({ expect }) => {
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
        {
          type: 'page',
          nodeId: 'second-page',
        },
        {
          type: 'goto',
          nodeId: 'goto',
          url: 'https://example.com',
          source: 'address-bar',
          inputs: {
            page: { nodeId: 'second-page' },
          },
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/disjoint-try-finally-blocks.ts'
  )
})

it('should close allocation block when resource has no references', async ({
  expect,
}) => {
  const script = await emitScript({
    defaultScenario: {
      nodes: [
        {
          type: 'page',
          nodeId: 'page',
        },
      ],
    },
    scenarios: {},
  })

  await expect(script).toMatchFileSnapshot(
    '__snapshots__/browser/close-allocation-block-when-resource-has-no-references.ts'
  )
})

it('should emit two actions on same locator inside same try-finally block', async ({
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
          selector: { type: 'css', selector: 'button' },
          inputs: {
            page: { nodeId: 'page' },
          },
        },
        {
          type: 'click',
          nodeId: 'click1',
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
        {
          type: 'click',
          nodeId: 'click2',
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
    '__snapshots__/browser/two-actions-on-same-locator-inside-same-try-finally-block.ts'
  )
})
