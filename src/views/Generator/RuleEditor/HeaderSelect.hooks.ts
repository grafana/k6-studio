import { Filter } from '@/types/rules'
import { matchFilter } from '@/rules/utils'
import { ProxyData } from '@/types'
import { useMemo } from 'react'

export function useHeaderOptions(
  recording: ProxyData[],
  extractFrom: 'request' | 'response',
  filter: Filter
) {
  return useMemo(() => {
    const filteredRequests = recording.filter((entry) =>
      matchFilter(entry.request, filter)
    )

    const headers = filteredRequests.flatMap(
      (request) => request?.[extractFrom]?.headers ?? []
    )

    const uniqueHeaderNames = Array.from(
      new Set(headers.map((header) => header[0]))
    )

    return uniqueHeaderNames.sort().map((headerName) => ({
      value: headerName,
      label: headerName,
    }))
  }, [recording, extractFrom, filter])
}
