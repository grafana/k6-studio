import { AnyBrowserAction, LocatorClickModifier } from '@/schemas/browserTest'
import { BrowserEvent, ClickEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'
import { isWebUrl } from '@/utils/browserEvents'
import { toElementLocatorOptions } from '@/utils/locator'
import { exhaustive } from '@/utils/typescript'

import { convertAssertion } from './convertAssertion'
import { isFollowedByImplicitNavigation } from './navigation'
import { detectWaits } from './waits'

function buildClickOptions(event: ClickEvent, nextEvent?: BrowserEvent) {
  const modifiers: LocatorClickModifier[] = []
  if (event.modifiers.alt) modifiers.push('Alt')
  if (event.modifiers.ctrl) modifiers.push('Control')
  if (event.modifiers.meta) modifiers.push('Meta')
  if (event.modifiers.shift) modifiers.push('Shift')

  const switchesToNewPage = nextEvent?.type === 'tab-opened'
  const waitForNavigation =
    !switchesToNewPage && isFollowedByImplicitNavigation(event, nextEvent)

  const options = {
    ...(event.button !== 'left' && { button: event.button }),
    ...(modifiers.length > 0 && { modifiers }),
    ...(waitForNavigation && { waitForNavigation: true }),
    ...(switchesToNewPage && { switchesToNewPage: true }),
  }

  // A plain left click needs no options object at all.
  return Object.keys(options).length > 0 ? options : undefined
}

function convertEvent(
  event: BrowserEvent,
  nextEvent?: BrowserEvent
): AnyBrowserAction | undefined {
  // Page-level events have no element target and so no frame scope.
  if (event.type === 'tab-opened') {
    return undefined
  }

  if (event.type === 'navigate-to-page') {
    if (event.source === 'implicit' || !isWebUrl(event.url)) return undefined

    return { id: crypto.randomUUID(), method: 'page.goto', url: event.url }
  }

  if (event.type === 'reload-page') {
    if (!isWebUrl(event.url)) return undefined

    return { id: crypto.randomUUID(), method: 'page.reload' }
  }

  switch (event.type) {
    case 'click':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toElementLocatorOptions(event.target, event.frames),
        options: buildClickOptions(event, nextEvent),
      }

    case 'input-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.fill',
        locator: toElementLocatorOptions(event.target, event.frames),
        value: event.value,
      }

    case 'check-change':
      return {
        id: crypto.randomUUID(),
        method: event.checked ? 'locator.check' : 'locator.uncheck',
        locator: toElementLocatorOptions(event.target, event.frames),
      }

    case 'radio-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toElementLocatorOptions(event.target, event.frames),
      }

    case 'select-change':
      return {
        id: crypto.randomUUID(),
        method: 'locator.selectOption',
        locator: toElementLocatorOptions(event.target, event.frames),
        values: event.selected.map((value) => ({ value })),
      }

    case 'submit-form':
      return {
        id: crypto.randomUUID(),
        method: 'locator.click',
        locator: toElementLocatorOptions(event.submitter, event.frames),
        options: isFollowedByImplicitNavigation(event, nextEvent)
          ? { waitForNavigation: true }
          : undefined,
      }

    case 'wait-for':
      return {
        id: crypto.randomUUID(),
        method: 'locator.waitFor',
        locator: toElementLocatorOptions(event.target, event.frames),
        options: event.options,
      }

    case 'assert':
      return convertAssertion(event)

    default:
      return exhaustive(event)
  }
}

/**
 * @param waits Timeout in milliseconds keyed by the id of the event the wait
 * must precede. Events that convert to nothing get no wait, since a wait
 * before a dropped action would be an orphan.
 */
export function convertEventsToActions(
  events: BrowserEvent[],
  waits?: Map<string, number>
): AnyBrowserAction[] {
  return events.flatMap((event, index) => {
    const action = convertEvent(event, events[index + 1])

    if (!action) {
      return []
    }

    const timeout = waits?.get(event.eventId)

    if (timeout === undefined) {
      return [action]
    }

    return [
      { id: crypto.randomUUID(), method: 'page.waitForTimeout', timeout },
      action,
    ]
  })
}

/**
 * Converts a recording into browser test actions, inserting the
 * `page.waitForTimeout` actions the replay needs to avoid racing requests
 * that the recording's own pacing waited out.
 */
export function convertRecordingToActions(
  events: BrowserEvent[],
  requests: ProxyData[]
): AnyBrowserAction[] {
  return convertEventsToActions(events, detectWaits(events, requests))
}
