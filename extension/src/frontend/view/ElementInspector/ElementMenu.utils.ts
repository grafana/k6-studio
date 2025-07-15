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

export function findLabeledControl({
  target,
  selector,
  roles,
}: TrackedElement): LabeledControl | null {
  if (
    target instanceof HTMLInputElement ||
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

  const element =
    findByForAttribute(label) ??
    findInChildren(label) ??
    findByLabelledBy(label)

  if (element === null) {
    return null
  }

  return {
    element,
    selector: generateSelector(element),
    roles: [...getElementRoles(element)],
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
