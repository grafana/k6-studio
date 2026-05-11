import { LocatorOptions } from '@/schemas/locator'
import { ElementSelector } from '@/schemas/recording'

function hasNonEmptyValue(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== ''
}

function pickBestLocatorType(
  selector: ElementSelector
): LocatorOptions['current'] {
  if (selector.role !== undefined) return 'role'
  if (hasNonEmptyValue(selector.label)) return 'label'
  if (hasNonEmptyValue(selector.alt)) return 'alt'
  if (hasNonEmptyValue(selector.placeholder)) return 'placeholder'
  if (hasNonEmptyValue(selector.title)) return 'title'
  if (hasNonEmptyValue(selector.testId)) return 'testid'
  return 'css'
}

export function toLocatorOptions(selector: ElementSelector): LocatorOptions {
  const values: LocatorOptions['values'] = {
    css: { type: 'css', selector: selector.css },
  }

  if (selector.role !== undefined) {
    values.role = {
      type: 'role',
      role: selector.role.role,
      options: { name: selector.role.name },
    }
  }

  if (hasNonEmptyValue(selector.testId)) {
    values.testid = { type: 'testid', testId: selector.testId }
  }

  if (hasNonEmptyValue(selector.alt)) {
    values.alt = { type: 'alt', text: selector.alt }
  }

  if (hasNonEmptyValue(selector.label)) {
    values.label = { type: 'label', label: selector.label }
  }

  if (hasNonEmptyValue(selector.placeholder)) {
    values.placeholder = {
      type: 'placeholder',
      placeholder: selector.placeholder,
    }
  }

  if (hasNonEmptyValue(selector.title)) {
    values.title = { type: 'title', title: selector.title }
  }

  return {
    current: pickBestLocatorType(selector),
    values,
  }
}
