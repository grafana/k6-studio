import {
  AnyBrowserAction,
  LocatorToHaveValueAction,
} from '@/schemas/browserTest'
import { LocatorOptions } from '@/schemas/locator'

interface LocatorFactoryOptions {
  locator?: LocatorOptions
}

type ActionByMethod<M extends AnyBrowserAction['method']> = Extract<
  AnyBrowserAction,
  { method: M }
>

export function createCheckAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.check'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.check',
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'checkbox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createUncheckAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.uncheck'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.uncheck',
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'checkbox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createClearAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.clear'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.clear',
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'textbox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createClickAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.click'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.click',
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'button',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createFillAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.fill'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.fill',
    value: '',
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'textbox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createSelectOptionAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.selectOption'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.selectOption',
    values: [{ value: '' }],
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'combobox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createWaitForAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.waitFor'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.waitFor',
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: '',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createToBeCheckedAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.toBeChecked'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.toBeChecked',
    checked: true,
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'checkbox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

type CreateToHaveValueActionOptions = LocatorFactoryOptions & {
  expected?: LocatorToHaveValueAction['expected']
}

export function createToHaveValueAction({
  locator,
  expected,
}: CreateToHaveValueActionOptions = {}): ActionByMethod<'locator.toHaveValue'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.toHaveValue',
    expected: expected ?? {
      current: 'single',
      values: {
        single: '',
      },
    },
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: 'textbox',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createToBeVisibleAction({
  locator,
}: LocatorFactoryOptions = {}): ActionByMethod<'locator.toBeVisible'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.toBeVisible',
    visible: true,
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: '',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

interface ToContainTextFactoryOptions extends LocatorFactoryOptions {
  expected?: string
}

export function createToContainTextAction({
  locator,
  expected = '',
}: ToContainTextFactoryOptions = {}): ActionByMethod<'locator.toContainText'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.toContainText',
    expected,
    locator: locator ?? {
      current: 'role',
      values: {
        role: {
          type: 'role',
          role: '',
          options: {
            exact: false,
          },
        },
      },
    },
  }
}

export function createGoToAction(): ActionByMethod<'page.goto'> {
  return {
    id: crypto.randomUUID(),
    method: 'page.goto',
    url: 'https://example.com',
  }
}

export function createPageReloadAction(): ActionByMethod<'page.reload'> {
  return {
    id: crypto.randomUUID(),
    method: 'page.reload',
  }
}

export function createWaitForTimeoutAction(): ActionByMethod<'page.waitForTimeout'> {
  return {
    id: crypto.randomUUID(),
    method: 'page.waitForTimeout',
    timeout: 1000,
  }
}
