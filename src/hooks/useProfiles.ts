import { useQuery } from '@tanstack/react-query'

import { queryClient } from '@/utils/query'

const QUERY_KEY = ['profiles'] as const

export function invalidateProfiles() {
  return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
}

export function useProfiles() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: window.studio.auth.getProfiles,
    staleTime: Infinity,
  })
}
