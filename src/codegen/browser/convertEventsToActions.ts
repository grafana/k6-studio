import { AnyBrowserAction, ActionLocator } from '@/main/runner/schema'
import {
  BrowserEvent,
  BrowserEventTarget,
  ElementSelector,
} from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

function toActionLocator(selector: ElementSelector): ActionLocator {
  if (selector.role !== undefined) {
    return {
      type: 'role',
      role: selector.role.role,
      options: selector.role.name
        ? { name: selector.role.name, exact: true }
        : undefined,
    }
  }

  if (selector.label !== undefined) {
    return { type: 'label', label: selector.label }
  }

  if (selector.alt !== undefined) {
    return { type: 'alt', text: selector.alt }
  }

  if (selector.placeholder !== undefined) {
    return { type: 'placeholder', placeholder: selector.placeholder }
  }

  if (selector.title !== undefined) {
    return { type: 'title', title: selector.title }
  }

  if (selector.testId !== undefined && selector.testId.trim() !== '') {
    return { type: 'testid', testId: selector.testId }
  }

  return { type: 'css', selector: selector.css }
}

function getLocator(target: BrowserEventTarget): ActionLocator {
  return toActionLocator(target.selectors)
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

function toAction(event: BrowserEvent): AnyBrowserAction | null {
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
        locator: getLocator(event.target),
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
        locator: getLocator(event.target),
        value: event.value,
      }

    case 'check-change':
      return event.checked
        ? { method: 'locator.check', locator: getLocator(event.target) }
        : { method: 'locator.uncheck', locator: getLocator(event.target) }

    case 'radio-change':
      return {
        method: 'locator.check',
        locator: getLocator(event.target),
      }

    case 'select-change':
      return {
        method: 'locator.selectOption',
        locator: getLocator(event.target),
        values: event.selected.map((value) => ({ value })),
      }

    case 'submit-form':
      return {
        method: 'locator.click',
        locator: getLocator(event.submitter),
      }

    case 'assert':
      // TODO: Add assertion support
      return null

    case 'wait-for':
      return {
        method: 'locator.waitFor',
        locator: getLocator(event.target),
        options: event.options,
      }

    default:
      return exhaustive(event)
  }
}

export function convertEventsToActions(
  events: BrowserEvent[]
): AnyBrowserAction[] {
  const actions: AnyBrowserAction[] = []

  for (const event of events) {
    const action = toAction(event)
    if (action !== null) {
      actions.push(action)
    }
  }

  return actions
}
