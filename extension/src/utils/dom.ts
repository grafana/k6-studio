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
      current instanceof HTMLButtonElement ||
      current instanceof HTMLLabelElement ||
      current instanceof HTMLTextAreaElement ||
      current instanceof HTMLSelectElement
    ) {
      return current
    }

    if (current instanceof HTMLAnchorElement && current.hasAttribute('href')) {
      return current
    }

    if (current instanceof HTMLImageElement && current.hasAttribute('usemap')) {
      return current
    }

    if (current instanceof HTMLInputElement && current.type !== 'hidden') {
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
