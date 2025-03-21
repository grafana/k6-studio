import { useMemo } from 'react'

import { shouldIncludeHeaderInScript } from '@/codegen/codegen.utils'
import { matchFilter } from '@/rules/utils'
import { ProxyData } from '@/types'
import { Filter } from '@/types/rules'

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

    const options = uniqueHeaderNames.sort().map((headerName) => ({
      value: headerName,
      label: headerName,
    }))

    // Don't show headers that are excluded from the codegen
    if (extractFrom === 'request') {
      return options.filter(({ value }) => shouldIncludeHeaderInScript(value))
    }

    return options
  }, [recording, extractFrom, filter])
}
