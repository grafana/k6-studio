import { ElementSelector } from '@/schemas/recording'
import { ElementRole } from '@/utils/dom/aria'
import {
  isHTMLAnchorElement,
  isHTMLButtonElement,
  isHTMLImageElement,
  isHTMLInputElement,
  isHTMLLabelElement,
  isHTMLSelectElement,
  isHTMLTextAreaElement,
} from '@/utils/dom/realm'

/**
 * Adapted list of widgets that are interacted with a simple click, regardless where the item
 * was clicked. Other widgets, such as "scrollbar", can have their behaviour change depending on
 * where the click happened.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles
 */
const SIMPLE_CLICK_WIDGET_ROLES = [
  'searchbox',
  'switch',
  'tab',
  'treeitem',
  'button',
  'checkbox',
  'link',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'textbox',
  'combobox',
]

export function findInteractiveElement(element: Element): Element | null {
  let current: Element | null = element

  while (current !== null) {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories#interactive_content
    if (
      isHTMLButtonElement(current) ||
      isHTMLLabelElement(current) ||
      isHTMLTextAreaElement(current) ||
      isHTMLSelectElement(current)
    ) {
      return current
    }

    if (isHTMLAnchorElement(current) && current.hasAttribute('href')) {
      return current
    }

    if (isHTMLImageElement(current) && current.hasAttribute('usemap')) {
      return current
    }

    if (isHTMLInputElement(current) && current.type !== 'hidden') {
      return current
    }

    const role = current.getAttribute('role')

    if (role !== null && SIMPLE_CLICK_WIDGET_ROLES.includes(role)) {
      return current
    }

    current = current.parentElement
  }

  return current
}

function findByForAttribute(target: HTMLLabelElement) {
  const forAttribute = target.getAttribute('for')

  if (forAttribute === null) {
    return null
  }

  // Look up in the label's own document so it works for labels inside iframes.
  return target.ownerDocument.getElementById(forAttribute)
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

export interface LabeledControl {
  element: Element
  selector: ElementSelector
  roles: ElementRole[]
}

export function findAssociatedElement(label: Element): Element | null {
  if (!isHTMLLabelElement(label)) {
    return null
  }

  return (
    findByForAttribute(label) ??
    findInChildren(label) ??
    findByLabelledBy(label)
  )
}

export function isNativeCheckbox(element: Element) {
  return isHTMLInputElement(element) && element.type === 'checkbox'
}

export function isNativeRadio(element: Element) {
  return isHTMLInputElement(element) && element.type === 'radio'
}

export function isNativeButton(element: Element) {
  if (isHTMLButtonElement(element)) {
    return true
  }

  if (!isHTMLInputElement(element)) {
    return false
  }

  return (
    element.type === 'button' ||
    element.type === 'submit' ||
    element.type === 'reset'
  )
}

export function isNonButtonInput(element: Element) {
  if (!isHTMLInputElement(element)) {
    return false
  }

  return (
    element.type !== 'button' &&
    element.type !== 'submit' &&
    element.type !== 'reset'
  )
}
