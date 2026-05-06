import { AnyBrowserAction } from '@/schemas/browserTest'

type ActionByMethod<M extends AnyBrowserAction['method']> = Extract<
  AnyBrowserAction,
  { method: M }
>

export function createCheckAction(): ActionByMethod<'locator.check'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.check',
    locator: {
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

export function createUncheckAction(): ActionByMethod<'locator.uncheck'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.uncheck',
    locator: {
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

export function createClearAction(): ActionByMethod<'locator.clear'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.clear',
    locator: {
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

export function createClickAction(): ActionByMethod<'locator.click'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.click',
    locator: {
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

export function createFillAction(): ActionByMethod<'locator.fill'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.fill',
    value: '',
    locator: {
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

export function createSelectOptionAction(): ActionByMethod<'locator.selectOption'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.selectOption',
    values: [{ value: '' }],
    locator: {
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

export function createWaitForAction(): ActionByMethod<'locator.waitFor'> {
  return {
    id: crypto.randomUUID(),
    method: 'locator.waitFor',
    locator: {
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
