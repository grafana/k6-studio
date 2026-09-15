import { describe, expect, it } from 'vitest'

import { createReplayEvent } from '@/main/runner/rrweb'

import { getPageIdAtTimestamp, NULL_PAGE_ID } from './HtmlInspector.utils'

describe('getPageIdAtTimestamp', () => {
  const pageA = createReplayEvent({
    tag: 'page-start',
    payload: {
      pageId: 'page-a',
      title: 'A',
      href: 'https://example.com/a',
      width: 1280,
      height: 720,
    },
    timestamp: 1000,
  })

  const pageB = createReplayEvent({
    tag: 'page-start',
    payload: {
      pageId: 'page-b',
      title: 'B',
      href: 'https://example.com/b',
      width: 1280,
      height: 720,
    },
    timestamp: 2000,
  })

  it('returns NULL_PAGE_ID when no page-start has occurred yet', () => {
    expect(getPageIdAtTimestamp([pageA, pageB], 999)).toBe(NULL_PAGE_ID)
  })

  it('returns the pageId for the latest page-start at or before the timestamp', () => {
    expect(getPageIdAtTimestamp([pageA, pageB], 1500)).toBe('page-a')
    expect(getPageIdAtTimestamp([pageA, pageB], 2000)).toBe('page-b')
    expect(getPageIdAtTimestamp([pageA, pageB], 2500)).toBe('page-b')
  })

  it('includes a page-start that occurs exactly at the timestamp', () => {
    expect(getPageIdAtTimestamp([pageA], 1000)).toBe('page-a')
  })

  it('ignores non page-start custom events', () => {
    const recordingEnd = createReplayEvent({
      tag: 'recording-end',
      payload: {},
      timestamp: 1800,
    })

    expect(getPageIdAtTimestamp([pageA, recordingEnd], 1900)).toBe('page-a')
  })

  it('recovers the earlier pageId after seeking past a later navigation', () => {
    // Simulates scrubbing backwards: events still contain later page-starts,
    // but the playback timestamp is before that navigation.
    expect(getPageIdAtTimestamp([pageA, pageB], 1500)).toBe('page-a')
  })
})
