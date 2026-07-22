import { BrowserEvent } from '@/schemas/recording'

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
