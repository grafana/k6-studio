import { BrowserEventTarget } from '@/schemas/recording'
import { ElementRole, getElementRoles } from '@/utils/dom/aria'
import { findAssociatedElement } from '@/utils/dom/dom'
import {
  isHTMLButtonElement,
  isHTMLInputElement,
  isHTMLLabelElement,
  isHTMLSelectElement,
  isHTMLTextAreaElement,
} from '@/utils/dom/realm'
import { getElementDetails } from '@/utils/dom/selectors'

import { CheckAssertionData } from './assertions/types'
import { TrackedElement } from './utils'

function* getAncestors(element: Element) {
  let currentElement: Element | null = element

  while (currentElement !== null) {
    yield currentElement

    currentElement = currentElement.parentElement
  }
}

export interface LabeledControl {
  element: Element
  target: BrowserEventTarget
  roles: ElementRole[]
}

export function findAssociatedControl({
  element,
  target,
  roles,
}: TrackedElement): LabeledControl | null {
  // If the target is already a control, then we don't need to do a search.
  if (
    isHTMLInputElement(element) ||
    isHTMLButtonElement(element) ||
    isHTMLSelectElement(element) ||
    isHTMLTextAreaElement(element)
  ) {
    return {
      element,
      target,
      roles,
    }
  }

  const label = [...getAncestors(element)].find((ancestor) =>
    isHTMLLabelElement(ancestor)
  )

  if (label === undefined) {
    return null
  }

  const associatedElement = findAssociatedElement(label)

  if (associatedElement === null) {
    return null
  }

  return {
    element: associatedElement,
    target: getElementDetails(associatedElement),
    roles: [...getElementRoles(associatedElement)],
  }
}

export function getCheckedState(
  element: Element
): CheckAssertionData['expected'] {
  if (isHTMLInputElement(element)) {
    if (element.indeterminate) {
      return 'indeterminate'
    }

    return element.checked ? 'checked' : 'unchecked'
  }

  switch (element.getAttribute('aria-checked')) {
    case 'true':
      return 'checked'

    case 'false':
      return 'unchecked'

    case 'mixed':
      return 'indeterminate'

    default:
      return 'unchecked'
  }
}

export function getTextBoxValue(element: Element): string {
  if (isHTMLInputElement(element) || isHTMLTextAreaElement(element)) {
    return element.value
  }

  // The input must be an aria textbox, so we'll use the textContent.
  return element.textContent ?? ''
}

export function isNative(role: ElementRole, element: Element) {
  // The 'switch' role differs from 'checkbox' only in semantics, so if it is on a
  // native checkbox we want the generated code to use `.toBeChecked()` and not
  // `.toHaveAttribute()`.
  if (
    role.role === 'switch' &&
    isHTMLInputElement(element) &&
    element.type === 'checkbox'
  ) {
    return true
  }

  return role.type === 'intrinsic'
}
