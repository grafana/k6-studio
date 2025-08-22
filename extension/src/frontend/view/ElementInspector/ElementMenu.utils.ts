import { ElementSelector } from '@/schemas/recording'
import { generateSelector } from 'extension/src/selectors'
import { ElementRole, getElementRoles } from 'extension/src/utils/aria'

import { TrackedElement } from './ElementInspector.hooks'
import { CheckAssertionData } from './assertions/types'

function findByForAttribute(target: HTMLLabelElement) {
  const forAttribute = target.getAttribute('for')

  if (forAttribute === null) {
    return null
  }

  return document.getElementById(forAttribute)
}

const CHILD_INPUT_SELECTOR = [
  // Hidden inputs are not labelable per the HTML specification
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="checkbox"]',
  '[role="radio"]',
].join(', ')

function findInChildren(target: HTMLLabelElement) {
  // According to the HTML specification, the labelled element is the first one
  // in "tree order" which is the same order that `querySelector` searches in.
  return target.querySelector(CHILD_INPUT_SELECTOR)
}

function findByLabelledBy(target: HTMLLabelElement) {
  if (target.id === '') {
    return null
  }

  return target.querySelector(`[aria-labelledby="${target.id}"]`)
}

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
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
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

  const associatedElement =
    findByForAttribute(label) ??
    findInChildren(label) ??
    findByLabelledBy(label)

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

export function getTextBoxValue(element: Element): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
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
    element instanceof HTMLInputElement &&
    element.type === 'checkbox'
  ) {
    return true
  }

  return role.type === 'intrinsic'
}
