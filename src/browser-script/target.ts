import { finder } from '@medv/finder'
import {
  queryAllByAltText,
  queryAllByLabelText,
  queryAllByPlaceholderText,
  queryAllByRole,
  queryAllByTestId,
  queryAllByTitle,
} from '@testing-library/dom'

import {
  AriaDetails,
  BrowserEventTarget,
  ElementSelector,
  RoleElementSelector,
} from '@/schemas/recording'

import { getAriaDetails } from './utils/aria'

function generateRoleSelector(
  element: Element,
  { roles, name }: AriaDetails
): RoleElementSelector | undefined {
  if (element instanceof HTMLElement === false) {
    return
  }

  const applicableRoles = roles.filter((role) => role !== 'generic')

  if (applicableRoles.length === 0) {
    return undefined
  }

  if (name === undefined || name.trim() === '') {
    return undefined
  }

  const [selector] = applicableRoles.flatMap((role) => {
    const matches = queryAllByRole(document.body, role, { name })

    if (!matches.includes(element)) {
      return []
    }

    if (matches.length > 1) {
      return []
    }

    return {
      role,
      name,
    }
  })

  return selector
}

function generateAltTextSelector(element: Element): string | undefined {
  if (
    element instanceof HTMLImageElement === false &&
    element instanceof HTMLAreaElement === false &&
    element instanceof HTMLInputElement === false
  ) {
    return undefined
  }

  if (element instanceof HTMLInputElement && element.type !== 'image') {
    return undefined
  }

  const alt = element.alt.trim()

  if (alt === '') {
    return undefined
  }

  const matches = queryAllByAltText(document.body, alt, { exact: true })

  if (matches.length !== 1) {
    return undefined
  }

  return alt
}

function generateLabelSelector(
  element: Element,
  { labels }: AriaDetails
): string | undefined {
  if (element instanceof HTMLElement === false) {
    return undefined
  }

  for (const label of labels) {
    const trimmed = label.trim()

    const matches = queryAllByLabelText(document.body, trimmed, {
      exact: true,
    })

    if (!matches.includes(element)) {
      continue
    }

    if (matches.length > 1) {
      continue
    }

    return trimmed
  }

  return undefined
}

function generatePlaceholderSelector(element: Element): string | undefined {
  if (
    element instanceof HTMLInputElement === false &&
    element instanceof HTMLTextAreaElement === false
  ) {
    return undefined
  }

  const placeholder = element.placeholder.trim()

  if (placeholder === '') {
    return undefined
  }

  const matches = queryAllByPlaceholderText(document.body, placeholder, {
    exact: true,
  })

  if (matches.length !== 1) {
    return undefined
  }

  if (!matches.includes(element)) {
    return undefined
  }

  return placeholder
}

function generateTitleSelector(element: Element): string | undefined {
  if (element instanceof HTMLElement === false) {
    return undefined
  }

  const title = element.title.trim()

  if (title === '') {
    return undefined
  }

  const matches = queryAllByTitle(document.body, title, { exact: true })

  if (matches.length !== 1) {
    return undefined
  }

  if (!matches.includes(element)) {
    return undefined
  }

  return title
}

function generateTestIdSelector(element: Element): string | undefined {
  if (element instanceof HTMLElement === false) {
    return undefined
  }

  const testId = element.getAttribute('data-testid')

  if (testId === null || testId.trim() === '') {
    return undefined
  }

  const matches = queryAllByTestId(document.body, testId)

  if (matches.length > 1 || !matches.includes(element)) {
    return undefined
  }

  return testId
}

function generateSelectors(
  element: Element,
  aria: AriaDetails
): ElementSelector {
  return {
    css: finder(element, {}),
    testId: generateTestIdSelector(element),
    alt: generateAltTextSelector(element),
    label: generateLabelSelector(element, aria),
    placeholder: generatePlaceholderSelector(element),
    title: generateTitleSelector(element),
    role: generateRoleSelector(element, aria),
  }
}

export function getEventTarget(element: Element): BrowserEventTarget {
  const aria = getAriaDetails(element)

  return {
    selectors: generateSelectors(element, aria),
    aria,
  }
}
