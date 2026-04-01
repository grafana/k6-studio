import { ActionLocator } from '@/main/runner/schema'
import { ElementSelector } from '@/schemas/recording'
import {
  GetByAltTextNodeSelector,
  GetByLabelNodeSelector,
  GetByRoleNodeSelector,
  GetByPlaceholderNodeSelector,
  GetByTitleNodeSelector,
  GetByTestIdNodeSelector,
  CssNodeSelector,
  NodeSelector,
} from '@/schemas/selectors'
import { exhaustive } from '@/utils/typescript'

function getRoleSelector(
  selectors: ElementSelector
): GetByRoleNodeSelector | null {
  if (selectors.role === undefined) {
    return null
  }

  return {
    type: 'role',
    role: selectors.role.role,
    name: selectors.role.name ? { value: selectors.role.name } : undefined,
  }
}

function getAltTextSelector(
  selectors: ElementSelector
): GetByAltTextNodeSelector | null {
  if (selectors.alt === undefined) {
    return null
  }

  return {
    type: 'alt',
    text: selectors.alt,
  }
}

function getLabelSelector(
  selectors: ElementSelector
): GetByLabelNodeSelector | null {
  if (selectors.label === undefined) {
    return null
  }

  return {
    type: 'label',
    text: selectors.label,
  }
}

function getPlaceholderSelector(
  selectors: ElementSelector
): GetByPlaceholderNodeSelector | null {
  if (selectors.placeholder === undefined) {
    return null
  }

  return {
    type: 'placeholder',
    text: selectors.placeholder,
  }
}

function getTitleSelector(
  selectors: ElementSelector
): GetByTitleNodeSelector | null {
  if (selectors.title === undefined) {
    return null
  }

  return {
    type: 'title',
    text: selectors.title,
  }
}

function getTestIdSelector(
  selectors: ElementSelector
): GetByTestIdNodeSelector | null {
  if (selectors.testId === undefined || selectors.testId.trim() === '') {
    return null
  }

  return {
    type: 'test-id',
    testId: selectors.testId,
  }
}

function getCssSelector(selectors: ElementSelector): CssNodeSelector {
  return {
    type: 'css',
    selector: selectors.css,
  }
}

export function getNodeSelector(selector: ElementSelector): NodeSelector {
  return (
    getRoleSelector(selector) ??
    getLabelSelector(selector) ??
    getAltTextSelector(selector) ??
    getPlaceholderSelector(selector) ??
    getTitleSelector(selector) ??
    getTestIdSelector(selector) ??
    getCssSelector(selector)
  )
}

export function toNodeSelector(locator: ActionLocator): NodeSelector {
  switch (locator.type) {
    case 'css':
      return {
        type: 'css',
        selector: locator.selector,
      }

    case 'role':
      return {
        type: 'role',
        role: locator.role,
        name: locator.options?.name
          ? {
              value: locator.options.name,
              exact: locator.options.exact,
            }
          : undefined,
      }

    case 'testid':
      return {
        type: 'test-id',
        testId: locator.testId,
      }

    case 'alt':
      return {
        type: 'alt',
        text: locator.text,
      }

    case 'label':
      return {
        type: 'label',
        text: locator.label,
      }

    case 'placeholder':
      return {
        type: 'placeholder',
        text: locator.placeholder,
      }

    case 'title':
      return {
        type: 'title',
        text: locator.title,
      }

    case 'text':
      return {
        type: 'text',
        text: locator.text,
      }

    default:
      return exhaustive(locator)
  }
}

export function isSelectorEqual(a: NodeSelector, b: NodeSelector): boolean {
  switch (a.type) {
    case 'css':
      return b.type === 'css' && a.selector === b.selector

    case 'test-id':
      return b.type === 'test-id' && a.testId === b.testId

    case 'role':
      return (
        b.type === 'role' &&
        a.role === b.role &&
        a.name?.value === b.name?.value &&
        a.name?.exact === b.name?.exact
      )

    case 'alt':
      return b.type === 'alt' && a.text === b.text

    case 'label':
      return b.type === 'label' && a.text === b.text

    case 'placeholder':
      return b.type === 'placeholder' && a.text === b.text

    case 'text':
      return b.type === 'text' && a.text === b.text

    case 'title':
      return b.type === 'title' && a.text === b.text

    default:
      return exhaustive(a)
  }
}
