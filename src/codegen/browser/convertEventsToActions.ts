import { BrowserTestAction, LocatorOptions } from '@/schemas/browserTest/v1'
import {
  BrowserEvent,
  BrowserEventTarget,
  ElementSelector,
} from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

function hasNonEmptyValue(value: string | undefined): value is string {
  return value !== undefined && value.trim() !== ''
}

function toLocatorOptions(selector: ElementSelector): LocatorOptions {
  const values: LocatorOptions['values'] = {}

  values.css = { type: 'css', selector: selector.css }

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

  if (selector.role !== undefined) {
    values.role = {
      type: 'role',
      role: selector.role.role,
      options: selector.role.name
        ? { name: selector.role.name, exact: true }
        : undefined,
    }
  }

  const current = pickBestLocatorType(selector)

  return { current, values }
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

function getLocatorOptions(target: BrowserEventTarget): LocatorOptions {
  return toLocatorOptions(target.selectors)
}

function toClickModifiers(modifiers: {
  ctrl: boolean
  shift: boolean
  alt: boolean
  meta: boolean
}): ('Alt' | 'Control' | 'Meta' | 'Shift')[] {
  const result: ('Alt' | 'Control' | 'Meta' | 'Shift')[] = []
  if (modifiers.ctrl) result.push('Control')
  if (modifiers.shift) result.push('Shift')
  if (modifiers.alt) result.push('Alt')
  if (modifiers.meta) result.push('Meta')
  return result
}

function toAction(event: BrowserEvent): BrowserTestAction | null {
  switch (event.type) {
    case 'navigate-to-page':
      if (event.source === 'implicit') {
        return null
      }
      return { method: 'page.goto', url: event.url }

    case 'reload-page':
      return { method: 'page.reload' }

    case 'click': {
      const clickModifiers = toClickModifiers(event.modifiers)
      const hasNonDefaultOptions =
        event.button !== 'left' || clickModifiers.length > 0

      return {
        method: 'locator.click',
        locator: getLocatorOptions(event.target),
        ...(hasNonDefaultOptions && {
          options: {
            button: event.button,
            modifiers: clickModifiers,
          },
        }),
      }
    }

    case 'input-change':
      return {
        method: 'locator.fill',
        locator: getLocatorOptions(event.target),
        value: event.value,
      }

    case 'check-change':
      return event.checked
        ? {
            method: 'locator.check',
            locator: getLocatorOptions(event.target),
          }
        : {
            method: 'locator.uncheck',
            locator: getLocatorOptions(event.target),
          }

    case 'radio-change':
      return {
        method: 'locator.check',
        locator: getLocatorOptions(event.target),
      }

    case 'select-change':
      return {
        method: 'locator.selectOption',
        locator: getLocatorOptions(event.target),
        values: event.selected.map((value) => ({ value })),
      }

    case 'submit-form':
      return {
        method: 'locator.click',
        locator: getLocatorOptions(event.submitter),
      }

    case 'assert':
      return null

    case 'wait-for':
      return {
        method: 'locator.waitFor',
        locator: getLocatorOptions(event.target),
        options: event.options,
      }

    default:
      return exhaustive(event)
  }
}

export function convertEventsToActions(
  events: BrowserEvent[]
): BrowserTestAction[] {
  const actions: BrowserTestAction[] = []

  for (const event of events) {
    const action = toAction(event)
    if (action !== null) {
      actions.push(action)
    }
  }

  return actions
}
