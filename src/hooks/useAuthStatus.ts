import { useQuery } from '@tanstack/react-query'

import { AuthStatus, toAuthStatus } from '@/handlers/auth/types'

export const profilesQueryKey = ['profiles']

export function useAuthStatus(): AuthStatus {
  const { data: profiles } = useQuery({
    queryKey: profilesQueryKey,
    queryFn: window.studio.auth.getProfiles,
  })

  return profiles ? toAuthStatus(profiles) : { type: 'signed-out' }
}
