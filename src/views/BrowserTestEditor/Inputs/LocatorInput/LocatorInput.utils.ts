import { ActionLocator } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

export function initializeLocatorValues(
  type: ActionLocator['type']
): ActionLocator {
  switch (type) {
    case 'css':
      return { type, selector: 'body' }
    case 'testid':
      return { type, testId: '' }
    case 'label':
      return { type, label: '' }
    case 'placeholder':
      return { type, placeholder: '' }
    case 'title':
      return { type, title: '' }
    case 'alt':
    case 'text':
      return { type, text: '' }
    case 'role':
      return { type, role: 'button' }
    default:
      return exhaustive(type)
  }
}

export function validateLocator(locator: ActionLocator): string | null {
  switch (locator.type) {
    case 'css':
      return locator.selector.trim() === ''
        ? 'CSS selector cannot be empty'
        : null
    case 'testid':
      return locator.testId.trim() === '' ? 'Test ID cannot be empty' : null
    case 'label':
      return locator.label.trim() === '' ? 'Label cannot be empty' : null
    case 'placeholder':
      return locator.placeholder.trim() === ''
        ? 'Placeholder cannot be empty'
        : null
    case 'title':
      return locator.title.trim() === '' ? 'Title cannot be empty' : null
    case 'alt':
    case 'text':
      return locator.text.trim() === '' ? 'Text cannot be empty' : null
    case 'role':
      return locator.role.trim() === '' ? 'Role cannot be empty' : null
    default:
      return exhaustive(locator)
  }
}
