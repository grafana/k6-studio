import { FieldErrors } from 'react-hook-form'

import { ActionLocator } from '@/main/runner/schema'
import { exhaustive } from '@/utils/typescript'

export type LocatorValidation = {
  isValid: boolean
  message?: string
  fieldErrors?: Record<string, string>
}

export function buildFieldErrors(
  name: string,
  message?: string
): FieldErrors | undefined {
  if (!message) {
    return undefined
  }

  return { [name]: { message } } as FieldErrors
}

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

export function validateLocator(locator: ActionLocator): LocatorValidation {
  switch (locator.type) {
    case 'css':
      if (locator.selector.trim() === '') {
        return {
          isValid: false,
          message: 'CSS selector cannot be empty',
          fieldErrors: { selector: 'CSS selector cannot be empty' },
        }
      }
      return { isValid: true }
    case 'testid':
      if (locator.testId.trim() === '') {
        return {
          isValid: false,
          message: 'Test ID cannot be empty',
          fieldErrors: { testId: 'Test ID cannot be empty' },
        }
      }
      return { isValid: true }
    case 'label':
      if (locator.label.trim() === '') {
        return {
          isValid: false,
          message: 'Label cannot be empty',
          fieldErrors: { label: 'Label cannot be empty' },
        }
      }
      return { isValid: true }
    case 'placeholder':
      if (locator.placeholder.trim() === '') {
        return {
          isValid: false,
          message: 'Placeholder cannot be empty',
          fieldErrors: { placeholder: 'Placeholder cannot be empty' },
        }
      }
      return { isValid: true }
    case 'title':
      if (locator.title.trim() === '') {
        return {
          isValid: false,
          message: 'Title cannot be empty',
          fieldErrors: { title: 'Title cannot be empty' },
        }
      }
      return { isValid: true }
    case 'alt':
    case 'text':
      if (locator.text.trim() === '') {
        return {
          isValid: false,
          message: 'Text cannot be empty',
          fieldErrors: { text: 'Text cannot be empty' },
        }
      }
      return { isValid: true }
    case 'role':
      if (locator.role.trim() === '') {
        return {
          isValid: false,
          message: 'Role cannot be empty',
          fieldErrors: { role: 'Role cannot be empty' },
        }
      }
      if (!locator.options?.name?.trim()) {
        return {
          isValid: false,
          message: 'Name is required for role locator',
          fieldErrors: { name: 'Name is required for role locator' },
        }
      }
      return { isValid: true }
    default:
      return exhaustive(locator)
  }
}
