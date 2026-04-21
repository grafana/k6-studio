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

// Same implementation as `@testing-library/dom` `fuzzyMatches` with identity normalizer.
function fuzzyMatch(accessibleName: string, substring: string): boolean {
  if (typeof accessibleName !== 'string') {
    return false
  }

  return accessibleName.toLowerCase().includes(substring.toLowerCase())
}

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

    case 'role': {
      const { role, name } = selector

      if (name === undefined) {
        return queryAllByRole(container, role)
      }

      return queryAllByRole(container, role, {
        name:
          name.exact === false
            ? (accessibleName) => fuzzyMatch(accessibleName, name.value)
            : name.value,
      })
    }

    case 'alt':
      return queryAllByAltText(container, selector.text.value, {
        exact: selector.text.exact,
      })

    case 'label':
      return queryAllByLabelText(container, selector.text.value, {
        exact: selector.text.exact,
      })

    case 'placeholder':
      return queryAllByPlaceholderText(container, selector.text.value, {
        exact: selector.text.exact,
      })

    case 'text':
      return queryAllByText(container, selector.text.value, {
        exact: selector.text.exact,
      })

    case 'title':
      return queryAllByTitle(container, selector.text.value, {
        exact: selector.text.exact,
      })

    default:
      return []
  }
}
