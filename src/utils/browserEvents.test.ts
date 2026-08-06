import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

import {
  groupEventsByPage,
  mergeLinearPages,
  normalizeEntryNavigation,
} from './browserEvents'

function navigate(tab: string, url: string): BrowserEvent {
  return {
    type: 'navigate-to-page',
    eventId: `${tab}-${url}`,
    timestamp: 0,
    tab,
    url,
    source: 'address-bar',
  }
}

function click(tab: string, css = 'div.test'): BrowserEvent {
  return {
    type: 'click',
    eventId: `${tab}-click-${css}`,
    timestamp: 0,
    tab,
    target: { selectors: { css } },
    button: 'left',
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
  }
}

function tabOpened(tab: string): BrowserEvent {
  return {
    type: 'tab-opened',
    eventId: `${tab}-opened`,
    timestamp: 0,
    tab,
  }
}

function reload(tab: string, url: string): BrowserEvent {
  return {
    type: 'reload-page',
    eventId: `${tab}-reload`,
    timestamp: 0,
    tab,
    url,
  }
}

function implicitNavigate(tab: string, url: string): BrowserEvent {
  return {
    type: 'navigate-to-page',
    eventId: `${tab}-implicit-${url}`,
    timestamp: 0,
    tab,
    url,
    source: 'implicit',
  }
}

describe('groupEventsByPage', () => {
  it('returns empty array for empty events', () => {
    expect(groupEventsByPage([])).toEqual([])
  })

  it('returns a single page for events from one tab', () => {
    const events = [navigate('tab1', 'https://example.com'), click('tab1')]

    const pages = groupEventsByPage(events)

    expect(pages).toHaveLength(1)
    expect(pages[0]).toMatchObject({
      tab: 'tab1',
      label: 'https://example.com',
      events,
    })
  })

  it('returns one page per tab in first-seen order', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      navigate('tab2', 'https://two.com'),
      click('tab1'),
      click('tab2'),
    ]

    const pages = groupEventsByPage(events)

    expect(pages.map((page) => page.tab)).toEqual(['tab1', 'tab2'])
    expect(pages[0]?.events).toEqual([events[0], events[2]])
    expect(pages[1]?.events).toEqual([events[1], events[3]])
  })

  it('labels a page with its first navigate-to-page url', () => {
    const events = [
      navigate('tab1', 'https://first.com'),
      navigate('tab1', 'https://second.com'),
    ]

    expect(groupEventsByPage(events)[0]?.label).toBe('https://first.com')
  })

  it('falls back to a reload-page url when there is no navigation', () => {
    const events = [reload('tab1', 'https://reloaded.com'), click('tab1')]

    expect(groupEventsByPage(events)[0]?.label).toBe('https://reloaded.com')
  })

  it('falls back to the tab id when no event has a url', () => {
    const events = [click('tab1')]

    expect(groupEventsByPage(events)[0]?.label).toBe('tab1')
  })

  it('skips internal urls when labelling a page', () => {
    const events = [
      navigate('tab1', 'chrome://new-tab-page/'),
      navigate('tab1', 'https://github.com/'),
    ]

    expect(groupEventsByPage(events)[0]?.label).toBe('https://github.com/')
  })

  it('falls back to the tab id when a page only has internal urls', () => {
    const events = [navigate('tab1', 'chrome://new-tab-page/')]

    expect(groupEventsByPage(events)[0]?.label).toBe('tab1')
  })
})

describe('normalizeEntryNavigation', () => {
  it('promotes an orphaned implicit entry navigation to address-bar', () => {
    const events = [
      implicitNavigate('tab1', 'https://github.com/'),
      click('tab1'),
    ]

    const [entry] = normalizeEntryNavigation(events)

    expect(entry).toMatchObject({
      type: 'navigate-to-page',
      source: 'address-bar',
    })
  })

  it('promotes the first web navigation, skipping internal navigations', () => {
    const events = [
      implicitNavigate('tab1', 'chrome://new-tab-page/'),
      implicitNavigate('tab1', 'https://github.com/'),
    ]

    const result = normalizeEntryNavigation(events)

    expect(result[0]).toMatchObject({ source: 'implicit' })
    expect(result[1]).toMatchObject({ source: 'address-bar' })
  })

  it('leaves an implicit navigation that a preceding click triggered', () => {
    const events = [
      click('tab1'),
      implicitNavigate('tab1', 'https://github.com/'),
    ]

    expect(normalizeEntryNavigation(events)).toEqual(events)
  })

  it('promotes when an earlier click triggered a different (internal) navigation', () => {
    const events = [
      click('tab1'),
      implicitNavigate('tab1', 'chrome://new-tab-page/'),
      implicitNavigate('tab1', 'https://github.com/'),
    ]

    const result = normalizeEntryNavigation(events)

    expect(result[2]).toMatchObject({
      url: 'https://github.com/',
      source: 'address-bar',
    })
  })

  it('leaves an explicit entry navigation unchanged', () => {
    const events = [navigate('tab1', 'https://github.com/'), click('tab1')]

    expect(normalizeEntryNavigation(events)).toEqual(events)
  })

  it('returns the events unchanged when there is no web navigation', () => {
    const events = [click('tab1')]

    expect(normalizeEntryNavigation(events)).toEqual(events)
  })
})

describe('mergeLinearPages', () => {
  it('returns null for a single page', () => {
    const events = [navigate('tab1', 'https://one.com'), click('tab1')]

    expect(mergeLinearPages(events, groupEventsByPage(events))).toBeNull()
  })

  it('merges two tabs when a click hands the journey off to the new tab', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ])
  })

  it('falls back to an explicit navigation when the new tab was opened manually', () => {
    // A manually opened tab starts on chrome://new-tab-page before the user
    // types the url. The preceding click did not open it, so replaying the
    // click and waiting for a page would hang.
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'button.unrelated'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'chrome://new-tab-page/'),
      navigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'button.unrelated'),
      implicitNavigate('tab2', 'chrome://new-tab-page/'),
      navigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ])
  })

  it('falls back to an explicit navigation when the click opened a different tab', () => {
    // The click opened a tab that is not exportable; waiting for a page after
    // replaying it would hand the test the wrong page.
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.junk'),
      tabOpened('tab3'),
      implicitNavigate('tab3', 'chrome://extensions/'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const pages = groupEventsByPage(events).filter(
      (page) => page.tab !== 'tab3'
    )

    const merged = mergeLinearPages(events, pages)

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.junk'),
      {
        ...implicitNavigate('tab2', 'https://two.com'),
        source: 'address-bar',
      },
      click('tab2', 'button.submit'),
    ])
  })

  it('drops trailing non-interaction events of the opener tab so the click stays adjacent to tab-opened', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      implicitNavigate('tab1', 'https://one.com/tracked'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ])
  })

  it('demotes the handed-off tab entry navigation so the click owns the landing', () => {
    // The recorder marks a popup's first navigation as address-bar because no
    // in-page request precedes it, but the click that opened the tab already
    // lands the test there.
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      navigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      { ...navigate('tab2', 'https://two.com'), source: 'implicit' },
      click('tab2', 'button.submit'),
    ])
  })

  it('falls back to an explicit entry navigation when no click opened the new tab', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      {
        ...implicitNavigate('tab2', 'https://two.com'),
        source: 'address-bar',
      },
      click('tab2', 'button.submit'),
    ])
  })

  it('merges three tabs chained by clicks', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.first'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'a.second'),
      tabOpened('tab3'),
      implicitNavigate('tab3', 'https://three.com'),
      click('tab3', 'button.done'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual(events)
  })

  it('returns null when the user keeps interacting with the opener tab', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
      click('tab1', 'a.back-in-first-tab'),
    ]

    expect(mergeLinearPages(events, groupEventsByPage(events))).toBeNull()
  })

  it('falls back to an explicit entry navigation when the last interaction before the handoff is not a click', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      {
        type: 'input-change',
        eventId: 'tab1-input',
        timestamp: 0,
        tab: 'tab1',
        target: { selectors: { css: 'input.search' } },
        value: 'hello',
        sensitive: false,
      } satisfies BrowserEvent,
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ]

    const merged = mergeLinearPages(events, groupEventsByPage(events))

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      {
        type: 'input-change',
        eventId: 'tab1-input',
        timestamp: 0,
        tab: 'tab1',
        target: { selectors: { css: 'input.search' } },
        value: 'hello',
        sensitive: false,
      },
      {
        ...implicitNavigate('tab2', 'https://two.com'),
        source: 'address-bar',
      },
      click('tab2', 'button.submit'),
    ])
  })

  it('ignores events from tabs that are not part of the exportable pages', () => {
    const events = [
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      tabOpened('tab3'),
      implicitNavigate('tab3', 'chrome://new-tab-page/'),
      click('tab2', 'button.submit'),
    ]

    const pages = groupEventsByPage(events).filter(
      (page) => page.tab !== 'tab3'
    )

    const merged = mergeLinearPages(events, pages)

    expect(merged).toEqual([
      navigate('tab1', 'https://one.com'),
      click('tab1', 'a.open'),
      tabOpened('tab2'),
      implicitNavigate('tab2', 'https://two.com'),
      click('tab2', 'button.submit'),
    ])
  })
})
