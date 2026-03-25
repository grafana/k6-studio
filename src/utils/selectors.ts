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
  container: HTMLElement | Document,
  selector: NodeSelector
): Element[] {
  const root = container instanceof Document ? container.body : container

  switch (selector.type) {
    case 'css':
      return Array.from(root.querySelectorAll(selector.selector))

    case 'test-id':
      return queryAllByTestId(root, selector.testId)

    case 'role':
      return queryAllByRole(root, selector.role, {
        name: selector.name,
      })

    case 'alt':
      return queryAllByAltText(root, selector.text)

    case 'label':
      return queryAllByLabelText(root, selector.text)

    case 'placeholder':
      return queryAllByPlaceholderText(root, selector.text)

    case 'text':
      return queryAllByText(root, selector.text)

    case 'title':
      return queryAllByTitle(root, selector.text)

    default:
      return []
  }
}
