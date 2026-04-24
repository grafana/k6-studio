import { ActionLocator } from '@/schemas/locator'
import { ElementSelector } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

function getRoleSelector(selectors: ElementSelector): ActionLocator | null {
  if (selectors.role === undefined) {
    return null
  }

  return {
    type: 'role',
    role: selectors.role.role,
    options: selectors.role.name
      ? { name: selectors.role.name, exact: true }
      : undefined,
  }
}

function getAltTextSelector(selectors: ElementSelector): ActionLocator | null {
  if (selectors.alt === undefined) {
    return null
  }

  return {
    type: 'alt',
    text: selectors.alt,
    options: { exact: true },
  }
}

function getLabelSelector(selectors: ElementSelector): ActionLocator | null {
  if (selectors.label === undefined) {
    return null
  }

  return {
    type: 'label',
    label: selectors.label,
    options: { exact: true },
  }
}

function getPlaceholderSelector(
  selectors: ElementSelector
): ActionLocator | null {
  if (selectors.placeholder === undefined) {
    return null
  }

  return {
    type: 'placeholder',
    placeholder: selectors.placeholder,
    options: { exact: true },
  }
}

function getTitleSelector(selectors: ElementSelector): ActionLocator | null {
  if (selectors.title === undefined) {
    return null
  }

  return {
    type: 'title',
    title: selectors.title,
    options: { exact: true },
  }
}

function getTestIdSelector(selectors: ElementSelector): ActionLocator | null {
  if (selectors.testId === undefined || selectors.testId.trim() === '') {
    return null
  }

  return {
    type: 'testid',
    testId: selectors.testId,
  }
}

function getCssSelector(selectors: ElementSelector): ActionLocator {
  return {
    type: 'css',
    selector: selectors.css,
  }
}

export function getNodeSelector(selector: ElementSelector): ActionLocator {
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

export function isSelectorEqual(a: ActionLocator, b: ActionLocator): boolean {
  switch (a.type) {
    case 'css':
      return b.type === 'css' && a.selector === b.selector

    case 'testid':
      return b.type === 'testid' && a.testId === b.testId

    case 'role':
      return (
        b.type === 'role' &&
        a.role === b.role &&
        a.options?.name === b.options?.name &&
        a.options?.exact === b.options?.exact
      )

    case 'alt':
      return (
        b.type === 'alt' &&
        a.text === b.text &&
        a.options?.exact === b.options?.exact
      )

    case 'label':
      return (
        b.type === 'label' &&
        a.label === b.label &&
        a.options?.exact === b.options?.exact
      )

    case 'placeholder':
      return (
        b.type === 'placeholder' &&
        a.placeholder === b.placeholder &&
        a.options?.exact === b.options?.exact
      )

    case 'text':
      return (
        b.type === 'text' &&
        a.text === b.text &&
        a.options?.exact === b.options?.exact
      )

    case 'title':
      return (
        b.type === 'title' &&
        a.title === b.title &&
        a.options?.exact === b.options?.exact
      )

    default:
      return exhaustive(a)
  }
}
