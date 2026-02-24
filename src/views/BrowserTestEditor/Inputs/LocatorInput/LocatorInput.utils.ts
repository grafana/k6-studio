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
