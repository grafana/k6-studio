import { selectFilteredRequests, useGeneratorStore } from '@/store/generator'

type GroupItem = { path: string; protocol: string }

export const useThresholdURLOptions = () => {
  const requests = useGeneratorStore(selectFilteredRequests)

  // Group requests by host
  const groupedRequests = requests.reduce<Record<string, GroupItem[]>>(
    (acc, { request }) => {
      const { host, path, url } = request
      const { protocol } = new URL(url)
      if (!acc[host]) {
        acc[host] = []
      }
      acc[host].push({ path, protocol })

      return acc
    },
    {}
  )

  // Flatten the results so it can be used in the Select component
  const urlOptionsMap = Object.keys(groupedRequests).reduce<
    { label: string; value: string; disabled?: boolean }[]
  >((acc, host) => {
    const addedPaths = new Set<string>()

    // Add the host as the first item with disabled prop
    acc.push({
      label: host,
      value: host,
      disabled: true,
    })

    // Add the requests for each host
    groupedRequests[host]?.forEach((request) => {
      const { protocol, path } = request
      const fullPath = new URL(`${protocol}//${host}${path}`).href

      if (!addedPaths.has(fullPath)) {
        acc.push({
          label: path,
          value: fullPath,
        })
        addedPaths.add(fullPath)
      }
    })

    return acc
  }, [])

  return [{ label: 'Across all URLs', value: '*' }, ...urlOptionsMap]
}
