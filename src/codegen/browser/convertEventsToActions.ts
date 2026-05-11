import { AnyBrowserAction, LocatorClickModifier } from '@/schemas/browserTest'
import { LocatorOptions } from '@/schemas/locator'
import { BrowserEvent, ClickEvent, ElementSelector } from '@/schemas/recording'

import { isFollowedByImplicitNavigation } from './navigation'

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
      options: selector.role.name
        ? { name: selector.role.name, exact: true }
        : undefined,
    }
  }

  if (hasNonEmptyValue(selector.testId)) {
    values.testid = { type: 'testid', testId: selector.testId }
  }

  if (hasNonEmptyValue(selector.alt)) {
    values.alt = { type: 'alt', text: selector.alt, options: { exact: true } }
  }

  if (hasNonEmptyValue(selector.label)) {
    values.label = {
      type: 'label',
      label: selector.label,
      options: { exact: true },
    }
  }

  if (hasNonEmptyValue(selector.placeholder)) {
    values.placeholder = {
      type: 'placeholder',
      placeholder: selector.placeholder,
      options: { exact: true },
    }
  }

  if (hasNonEmptyValue(selector.title)) {
    values.title = {
      type: 'title',
      title: selector.title,
      options: { exact: true },
    }
  }

  return {
    current: pickBestLocatorType(selector),
    values,
  }
}

function buildClickOptions(event: ClickEvent, nextEvent?: BrowserEvent) {
  const modifiers: LocatorClickModifier[] = []
  if (event.modifiers.alt) modifiers.push('Alt')
  if (event.modifiers.ctrl) modifiers.push('Control')
  if (event.modifiers.meta) modifiers.push('Meta')
  if (event.modifiers.shift) modifiers.push('Shift')

  const waitForNavigation = isFollowedByImplicitNavigation(event, nextEvent)
  const isDefaultClick =
    event.button === 'left' && modifiers.length === 0 && !waitForNavigation

  if (isDefaultClick) return undefined

  return {
    ...(event.button !== 'left' && { button: event.button }),
    ...(modifiers.length > 0 && { modifiers }),
    ...(waitForNavigation && { waitForNavigation: true }),
  }
}

function convertEvent(
  event: BrowserEvent,
  nextEvent?: BrowserEvent
): AnyBrowserAction | undefined {
  switch (event.type) {
    case 'navigate-to-page':
      if (event.source === 'implicit') return undefined

      return { id: crypto.randomUUID(), method: 'page.goto', url: event.url }

    case 'reload-page':
      return { id: crypto.randomUUID(), method: 'page.reload' }

    case 'click':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toLocatorOptions(event.target.selectors),
        options: buildClickOptions(event, nextEvent),
      }

    case 'input-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.fill',
        locator: toLocatorOptions(event.target.selectors),
        value: event.value,
      }

    case 'check-change':
      return {
        id: crypto.randomUUID(),
        method: event.checked ? 'locator.check' : 'locator.uncheck',
        locator: toLocatorOptions(event.target.selectors),
      }

    case 'radio-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toLocatorOptions(event.target.selectors),
      }

    case 'select-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.selectOption',
        locator: toLocatorOptions(event.target.selectors),
        values: event.selected.map((value) => ({ value })),
      }

    case 'submit-form':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toLocatorOptions(event.submitter.selectors),
        options: isFollowedByImplicitNavigation(event, nextEvent)
          ? { waitForNavigation: true }
          : undefined,
      }

    case 'wait-for':
      return {
        id: crypto.randomUUID(),
        method: 'locator.waitFor',
        locator: toLocatorOptions(event.target.selectors),
        options: event.options,
      }

    case 'assert':
      return undefined
  }
}

export function convertEventsToActions(
  events: BrowserEvent[]
): AnyBrowserAction[] {
  return events.flatMap((event, index) => {
    const action = convertEvent(event, events[index + 1])
    return action ? [action] : []
  })
}
