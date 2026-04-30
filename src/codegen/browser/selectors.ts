import { ElementLocator } from '@/schemas/locator'
import { ElementSelector } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

function getRoleLocator(selectors: ElementSelector): ElementLocator | null {
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

function getAltTextLocator(selectors: ElementSelector): ElementLocator | null {
  if (selectors.alt === undefined) {
    return null
  }

  return {
    type: 'alt',
    text: selectors.alt,
    options: { exact: true },
  }
}

function getLabelLocator(selectors: ElementSelector): ElementLocator | null {
  if (selectors.label === undefined) {
    return null
  }

  return {
    type: 'label',
    label: selectors.label,
    options: { exact: true },
  }
}

function getPlaceholderLocator(
  selectors: ElementSelector
): ElementLocator | null {
  if (selectors.placeholder === undefined) {
    return null
  }

  return {
    type: 'placeholder',
    placeholder: selectors.placeholder,
    options: { exact: true },
  }
}

function getTitleLocator(selectors: ElementSelector): ElementLocator | null {
  if (selectors.title === undefined) {
    return null
  }

  return {
    type: 'title',
    title: selectors.title,
    options: { exact: true },
  }
}

function getTestIdLocator(selectors: ElementSelector): ElementLocator | null {
  if (selectors.testId === undefined || selectors.testId.trim() === '') {
    return null
  }

  return {
    type: 'testid',
    testId: selectors.testId,
  }
}

function getCssLocator(selectors: ElementSelector): ElementLocator {
  return {
    type: 'css',
    selector: selectors.css,
  }
}

export function getElementLocator(selector: ElementSelector): ElementLocator {
  return (
    getRoleLocator(selector) ??
    getLabelLocator(selector) ??
    getAltTextLocator(selector) ??
    getPlaceholderLocator(selector) ??
    getTitleLocator(selector) ??
    getTestIdLocator(selector) ??
    getCssLocator(selector)
  )
}

export function isLocatorEqual(a: ElementLocator, b: ElementLocator): boolean {
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
