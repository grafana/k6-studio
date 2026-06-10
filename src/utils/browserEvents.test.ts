import { describe, expect, it } from 'vitest'

import { BrowserEvent } from '@/schemas/recording'

import { groupEventsByPage, normalizeEntryNavigation } from './browserEvents'

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
    eventId: `${tab}-click`,
    timestamp: 0,
    tab,
    target: { selectors: { css } },
    button: 'left',
    modifiers: { ctrl: false, shift: false, alt: false, meta: false },
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

  it('leaves an explicit entry navigation unchanged', () => {
    const events = [navigate('tab1', 'https://github.com/'), click('tab1')]

    expect(normalizeEntryNavigation(events)).toEqual(events)
  })

  it('returns the events unchanged when there is no web navigation', () => {
    const events = [click('tab1')]

    expect(normalizeEntryNavigation(events)).toEqual(events)
  })
})
