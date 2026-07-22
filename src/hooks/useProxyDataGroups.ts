import { useMemo } from 'react'

import { DEFAULT_GROUP_NAME } from '@/constants'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'
import { getTimelineItemTimestamp, sortByTimestamp } from '@/utils/timeline'

/** Returns groups derived from the given proxy data and browser events, each
 * carrying the timestamp of its earliest item, in chronological order. */
export function useProxyDataGroups(
  proxyData: ProxyData[],
  browserEvents: BrowserEvent[] = []
) {
  return useMemo(() => {
    const items = sortByTimestamp([...proxyData, ...browserEvents])

    const startedDateTimeByName = new Map<string, number>()

    for (const item of items) {
      const name = item.group || DEFAULT_GROUP_NAME

      if (!startedDateTimeByName.has(name)) {
        startedDateTimeByName.set(name, getTimelineItemTimestamp(item))
      }
    }

    return Array.from(startedDateTimeByName.entries())
      .map(([name, startedDateTime]) => ({
        id: name,
        name,
        startedDateTime,
      }))
      .sort((a, b) => a.startedDateTime - b.startedDateTime)
  }, [proxyData, browserEvents])
}
