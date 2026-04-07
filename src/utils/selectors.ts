import {
  queryAllByAltText,
  queryAllByLabelText,
  queryAllByPlaceholderText,
  queryAllByRole,
  queryAllByTestId,
  queryAllByText,
  queryAllByTitle,
} from '@testing-library/dom'

import { NodeSelector } from '@/schemas/selectors'

/**
 * Find elements in the DOM using a NodeSelector.
 * This function supports all selector types (css, role, test-id, alt, label, placeholder, text, title).
 */
export function findElementsBySelector(
  container: HTMLElement,
  selector: NodeSelector
): Element[] {
  switch (selector.type) {
    case 'css':
      return Array.from(container.querySelectorAll(selector.selector))

    case 'test-id':
      return queryAllByTestId(container, selector.testId)

    case 'role':
      return queryAllByRole(container, selector.role, {
        name: selector.name?.value,
      })

    case 'alt':
      return queryAllByAltText(container, selector.text.value)

    case 'label':
      return queryAllByLabelText(container, selector.text.value)

    case 'placeholder':
      return queryAllByPlaceholderText(container, selector.text.value)

    case 'text':
      return queryAllByText(container, selector.text.value)

    case 'title':
      return queryAllByTitle(container, selector.text.value)

    default:
      return []
  }
}
