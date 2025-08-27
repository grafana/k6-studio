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

  while (element !== null) {
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Content_categories#interactive_content
    if (
      element instanceof HTMLButtonElement ||
      element instanceof HTMLLabelElement ||
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      return element
    }

    if (element instanceof HTMLAnchorElement && element.hasAttribute('href')) {
      return element
    }

    if (element instanceof HTMLImageElement && element.hasAttribute('usemap')) {
      return element
    }

    if (element instanceof HTMLInputElement && element.type !== 'hidden') {
      return element
    }

    const role = element.getAttribute('role')

    if (role !== null && SIMPLE_CLICK_WIDGET_ROLES.includes(role)) {
      return element
    }

    if (element.parentElement === null) {
      return null
    }

    current = element.parentElement
  }

  return current
}
