import { AuthStatus } from '@/handlers/auth/types'

import { useProfiles } from './useProfiles'

export function useAuthStatus(): AuthStatus {
  const { data: profiles } = useProfiles()

  const current = profiles?.stacks[profiles.currentStack]
  return current
    ? { type: 'signed-in', stack: current }
    : { type: 'signed-out' }
}
