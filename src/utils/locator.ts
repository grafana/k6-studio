import {
  AltLocator,
  CssLocator,
  ElementLocator,
  LabelLocator,
  LocatorOptions,
  PlaceholderLocator,
  RoleLocator,
  TestIdLocator,
  TitleLocator,
} from '@/schemas/locator'
import { BrowserEventTarget, ElementSelector } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

function hasNonEmptyString(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== ''
}

export function getRoleLocator(selectors: ElementSelector): RoleLocator | null {
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

export function getAltTextLocator(
  selectors: ElementSelector
): AltLocator | null {
  if (!hasNonEmptyString(selectors.alt)) {
    return null
  }

  return {
    type: 'alt',
    text: selectors.alt,
    options: { exact: true },
  }
}

export function getLabelLocator(
  selectors: ElementSelector
): LabelLocator | null {
  if (!hasNonEmptyString(selectors.label)) {
    return null
  }

  return {
    type: 'label',
    label: selectors.label,
    options: { exact: true },
  }
}

export function getPlaceholderLocator(
  selectors: ElementSelector
): PlaceholderLocator | null {
  if (!hasNonEmptyString(selectors.placeholder)) {
    return null
  }

  return {
    type: 'placeholder',
    placeholder: selectors.placeholder,
    options: { exact: true },
  }
}

export function getTitleLocator(
  selectors: ElementSelector
): TitleLocator | null {
  if (!hasNonEmptyString(selectors.title)) {
    return null
  }

  return {
    type: 'title',
    title: selectors.title,
    options: { exact: true },
  }
}

export function getTestIdLocator(
  selectors: ElementSelector
): TestIdLocator | null {
  if (!hasNonEmptyString(selectors.testId)) {
    return null
  }

  return {
    type: 'testid',
    testId: selectors.testId,
  }
}

export function getCssLocator(selectors: ElementSelector): CssLocator {
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

export function toLocatorOptions(selector: ElementSelector): LocatorOptions {
  return {
    current: getElementLocator(selector).type,
    values: {
      css: getCssLocator(selector),
      role: getRoleLocator(selector) ?? undefined,
      testid: getTestIdLocator(selector) ?? undefined,
      alt: getAltTextLocator(selector) ?? undefined,
      label: getLabelLocator(selector) ?? undefined,
      placeholder: getPlaceholderLocator(selector) ?? undefined,
      title: getTitleLocator(selector) ?? undefined,
    },
  }
}

// Converts a recorded event's iframe chain into locator options for each frame.
export function toFrameOptions(
  frames: BrowserEventTarget[] | undefined
): LocatorOptions[] | undefined {
  return frames?.map((frame) => toLocatorOptions(frame.selectors))
}
