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
  const urlOptionsMap = Object.keys(groupedRequests).map((host) => {
    const addedPaths = new Set<string>()
    const options: { label: string; value: string }[] = []

    // Add the requests for each host
    groupedRequests[host]?.forEach((request) => {
      const { protocol, path } = request
      const fullPath = new URL(`${protocol}//${host}${path}`).href

      if (!addedPaths.has(fullPath)) {
        options.push({
          label: path,
          value: fullPath,
        })
        addedPaths.add(fullPath)
      }
    })

    return {
      label: host,
      options,
    }
  })

  return [{ label: 'Across all URLs', value: '*' }, ...urlOptionsMap]
}
