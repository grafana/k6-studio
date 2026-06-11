import { AnyBrowserAction, LocatorClickModifier } from '@/schemas/browserTest'
import { BrowserEvent, ClickEvent } from '@/schemas/recording'
import { toFrameOptions, toLocatorOptions } from '@/utils/locator'
import { exhaustive } from '@/utils/typescript'

import { convertAssertion } from './convertAssertion'
import { isFollowedByImplicitNavigation } from './navigation'

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
  // Page-level events have no element target and so no frame scope.
  if (event.type === 'navigate-to-page') {
    if (event.source === 'implicit') return undefined

    return { id: crypto.randomUUID(), method: 'page.goto', url: event.url }
  }

  if (event.type === 'reload-page') {
    return { id: crypto.randomUUID(), method: 'page.reload' }
  }

  // The remaining events all target an element, which may live inside iframes.
  const frames = toFrameOptions(event.frames)

  switch (event.type) {
    case 'click':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toLocatorOptions(event.target.selectors),
        frames,
        options: buildClickOptions(event, nextEvent),
      }

    case 'input-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.fill',
        locator: toLocatorOptions(event.target.selectors),
        frames,
        value: event.value,
      }

    case 'check-change':
      return {
        id: crypto.randomUUID(),
        method: event.checked ? 'locator.check' : 'locator.uncheck',
        locator: toLocatorOptions(event.target.selectors),
        frames,
      }

    case 'radio-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toLocatorOptions(event.target.selectors),
        frames,
      }

    case 'select-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.selectOption',
        locator: toLocatorOptions(event.target.selectors),
        frames,
        values: event.selected.map((value) => ({ value })),
      }

    case 'submit-form':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toLocatorOptions(event.submitter.selectors),
        frames,
        options: isFollowedByImplicitNavigation(event, nextEvent)
          ? { waitForNavigation: true }
          : undefined,
      }

    case 'wait-for':
      return {
        id: crypto.randomUUID(),
        method: 'locator.waitFor',
        locator: toLocatorOptions(event.target.selectors),
        frames,
        options: event.options,
      }

    case 'assert':
      return convertAssertion(event)

    default:
      return exhaustive(event)
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
