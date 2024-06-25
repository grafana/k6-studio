import { GroupedProxyData } from '@/types'

export function applyRequestFilter(
  requests: GroupedProxyData,
  filters: string[]
) {
  return Object.entries(requests).reduce((acc, [groupName, groupRequests]) => {
    const filteredGroupRequests = groupRequests.filter((request) => {
      return filters.every((filter) => {
        return request.request.url.includes(filter)
      })
    })

    if (filteredGroupRequests.length === 0) return acc

    return { ...acc, [groupName]: filteredGroupRequests }
  }, {})
}
