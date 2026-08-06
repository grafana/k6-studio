import { BrowserEvent } from '@/schemas/recording'
import { exhaustive } from '@/utils/typescript'

export interface EventPage {
  tab: string
  label: string
  events: BrowserEvent[]
}

/**
 * Whether a url can be used as a browser test target. Recordings can include
 * browser-internal pages (e.g. `chrome://new-tab-page/` when a tab opens) that
 * cannot be navigated to with `page.goto`.
 */
export function isWebUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

function getWebUrl(event: BrowserEvent): string | undefined {
  return 'url' in event && isWebUrl(event.url) ? event.url : undefined
}

/**
 * Groups browser events by the tab (page) they occurred in, preserving the
 * order in which tabs were first seen. Each page is labelled with the first
 * navigation url found in its events, falling back to the tab id.
 */
export function groupEventsByPage(events: BrowserEvent[]): EventPage[] {
  const pages = new Map<string, EventPage>()

  for (const event of events) {
    let page = pages.get(event.tab)

    if (page === undefined) {
      page = { tab: event.tab, label: event.tab, events: [] }
      pages.set(event.tab, page)
    }

    page.events.push(event)

    // Label the page with the first web url seen in it.
    if (page.label === page.tab) {
      page.label = getWebUrl(event) ?? page.label
    }
  }

  return [...pages.values()]
}

/**
 * When a page is exported on its own, the navigation that opened it may have
 * been recorded as implicit because the action that triggered it lives in
 * another tab. Without that triggering action the navigation is dropped during
 * conversion, leaving the test with no `page.goto`. Promote such an orphaned
 * entry navigation to an explicit one so conversion emits the goto.
 */
export function normalizeEntryNavigation(
  events: BrowserEvent[]
): BrowserEvent[] {
  const entryIndex = events.findIndex(
    (event) => event.type === 'navigate-to-page' && isWebUrl(event.url)
  )

  const entry = events[entryIndex]

  if (entry?.type !== 'navigate-to-page' || entry.source !== 'implicit') {
    return events
  }

  // We model an implicit navigation as the result of the action directly before
  // it (this mirrors how `isFollowedByImplicitNavigation` pairs a click with the
  // navigation it causes). So if the preceding event is a click or form submit,
  // the navigation is an in-page result and we leave it alone. Otherwise it is
  // an orphan to promote. For example, a tab opened from another tab starts with
  // [navigate(chrome://new-tab-page), navigate(https://app)]: nothing in this
  // tab triggered the app navigation, so it is promoted. A same-tab
  // [click, navigate(https://app)] is left as-is, since the click owns it.
  const previous = events[entryIndex - 1]
  const triggeredByPreviousAction =
    previous?.type === 'click' || previous?.type === 'submit-form'

  if (triggeredByPreviousAction) {
    return events
  }

  return events.map((event, index) =>
    index === entryIndex ? { ...event, source: 'address-bar' } : event
  )
}

/**
 * Whether an event was directly caused by the user acting on the page, as
 * opposed to a side effect like an implicit navigation or a tab opening.
 */
function isInteraction(event: BrowserEvent): boolean {
  switch (event.type) {
    case 'click':
    case 'input-change':
    case 'check-change':
    case 'radio-change':
    case 'select-change':
    case 'submit-form':
    case 'assert':
    case 'wait-for':
    case 'reload-page':
      return true

    case 'navigate-to-page':
      return event.source !== 'implicit'

    case 'tab-opened':
      return false

    default:
      return exhaustive(event)
  }
}

/**
 * Merges a multi-tab recording into a single linear event list when the
 * journey never returns to a tab after moving on: each tab's interactions must
 * end before the next tab's events begin. When the last interaction in a tab
 * is the click that opened the next one, the click is kept adjacent to the
 * next tab's `tab-opened` event so conversion can pair them into a click that
 * switches to the new page. Otherwise the next tab's entry navigation is
 * promoted to an explicit one, producing a `page.goto` instead. Returns null
 * when the recording branches between tabs and cannot be merged.
 */
export function mergeLinearPages(
  events: BrowserEvent[],
  pages: EventPage[]
): BrowserEvent[] | null {
  if (pages.length < 2) {
    return null
  }

  const positions = new Map<BrowserEvent, number>(
    events.map((event, index) => [event, index])
  )

  const position = (event: BrowserEvent) => positions.get(event) ?? -1

  const merged: BrowserEvent[] = []
  let handedOffByClick = false

  for (const [index, page] of pages.entries()) {
    const next = pages[index + 1]

    let slice: BrowserEvent[] = page.events.filter(
      (event) => event.type !== 'tab-opened'
    )

    // A tab reached through a click handoff starts on the right page already,
    // so its implicit entry navigations can be left for conversion to drop.
    // Any other tab (including the first) needs its entry navigation promoted
    // to an explicit one, mirroring the single-page export path.
    if (!handedOffByClick) {
      slice = normalizeEntryNavigation(slice)
    }

    const nextEntry = next?.events[0]

    if (next === undefined || nextEntry === undefined) {
      merged.push(...slice)
      break
    }

    // Events within a tab are in source order, so checking the last
    // interaction is enough to know the user never came back to this tab.
    const lastInteraction = page.events.findLast(isInteraction)

    if (
      lastInteraction !== undefined &&
      position(lastInteraction) > position(nextEntry)
    ) {
      return null
    }

    if (lastInteraction?.type !== 'click') {
      merged.push(...slice)
      handedOffByClick = false
      continue
    }

    merged.push(...slice.slice(0, slice.indexOf(lastInteraction) + 1))
    merged.push(
      // Old recordings (schema v1) have no tab-opened events, so mint one to
      // mark the handoff for conversion.
      next.events.find((event) => event.type === 'tab-opened') ?? {
        type: 'tab-opened',
        eventId: crypto.randomUUID(),
        timestamp: lastInteraction.timestamp,
        tab: next.tab,
      }
    )
    handedOffByClick = true
  }

  return merged
}
