import { useQuery } from '@tanstack/react-query'

import { AuthStatus } from '@/handlers/auth/types'

export const profilesQueryKey = ['profiles']

export function useAuthStatus(): AuthStatus {
  const { data: profiles } = useQuery({
    queryKey: profilesQueryKey,
    queryFn: window.studio.auth.getProfiles,
  })

  const current = profiles?.stacks[profiles.currentStack]
  return current
    ? { type: 'signed-in', stack: current }
    : { type: 'signed-out' }
}
