import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'

export type TimelineItem = ProxyData | BrowserEvent

export function isProxyData(item: TimelineItem): item is ProxyData {
  return 'request' in item
}

/** Proxy timestamps are in seconds, browser event timestamps are in milliseconds. */
export function getTimelineItemTimestamp(item: TimelineItem): number {
  return isProxyData(item) ? item.request.timestampStart * 1000 : item.timestamp
}

export function sortByTimestamp<T extends TimelineItem>(
  items: readonly T[]
): T[] {
  return items.toSorted(
    (a, b) => getTimelineItemTimestamp(a) - getTimelineItemTimestamp(b)
  )
}
