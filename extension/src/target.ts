import { finder } from '@medv/finder'
import { queryAllByRole, queryAllByTestId } from '@testing-library/dom'

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
