import { ElementSelector } from '@/schemas/recording'
import { generateSelector } from 'extension/src/selectors'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'
import { findAssociatedElement } from 'extension/src/utils/dom'

import { TrackedElement } from './ElementInspector.hooks'
import { CheckAssertionData } from './assertions/types'

function* getAncestors(element: Element) {
  let currentElement: Element | null = element

  while (currentElement !== null) {
    yield currentElement

    currentElement = currentElement.parentElement
  }
}

export interface LabeledControl {
  element: Element
  selector: ElementSelector
  roles: ElementRole[]
}

export function findAssociatedControl({
  target,
  selector,
  roles,
}: TrackedElement): LabeledControl | null {
  // If the target is already a control, then we don't need to do a search.
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLButtonElement ||
    target instanceof HTMLSelectElement
  ) {
    return {
      element: target,
      selector,
      roles,
    }
  }

  const label = [...getAncestors(target)].find(
    (ancestor) => ancestor instanceof HTMLLabelElement
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
    selector: generateSelector(associatedElement),
    roles: [...getElementRoles(associatedElement)],
  }
}

export function getCheckedState(
  element: Element
): CheckAssertionData['expected'] {
  if (element instanceof HTMLInputElement) {
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

export function isNative(role: ElementRole, element: Element) {
  // The 'switch' role differs from 'checkbox' only in semantics, so if it is on a
  // native checkbox we want the generated code to use `.toBeChecked()` and not
  // `.toHaveAttribute()`.
  if (
    role.role === 'switch' &&
    element instanceof HTMLInputElement &&
    element.type === 'checkbox'
  ) {
    return true
  }

  return role.type === 'intrinsic'
}
