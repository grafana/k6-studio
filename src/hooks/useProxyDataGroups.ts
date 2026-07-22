import { useMemo } from 'react'

import { DEFAULT_GROUP_NAME } from '@/constants'
import { BrowserEvent } from '@/schemas/recording'
import { ProxyData } from '@/types'

/** Returns an array of unique group names from the given proxy data and browser events, in chronological order */
export function useProxyDataGroups(
  proxyData: ProxyData[],
  browserEvents: BrowserEvent[] = []
) {
  return useMemo(() => {
    const entries = [
      ...proxyData.map((data) => ({
        name: data.group ?? DEFAULT_GROUP_NAME,
        timestamp: data.request.timestampStart,
      })),
      ...browserEvents.map((event) => ({
        name: event.group ?? DEFAULT_GROUP_NAME,
        timestamp: event.timestamp,
      })),
    ].sort((a, b) => a.timestamp - b.timestamp)

    const names = new Set(entries.map((entry) => entry.name))

    return Array.from(names).map((name) => {
      return {
        id: name,
        // External scripts without groups will have have group=""
        name: name === '' ? DEFAULT_GROUP_NAME : name,
      }
    })
  }, [proxyData, browserEvents])
}
