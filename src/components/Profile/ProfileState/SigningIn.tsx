import { UserProfiles } from '@/schemas/profile'

import { GrafanaCloudSignIn } from '../GrafanaCloudSignIn'

import { SignedInState, SignedOutState, SigningInState } from './types'

interface SigningInStateProps {
  state: SigningInState
  onStateChange: (
    state: SignedInState | SigningInState | SignedOutState
  ) => void
}

export function SigningIn({ onStateChange }: SigningInStateProps) {
  const handleSignIn = (profiles: UserProfiles) => {
    const current = profiles.stacks[profiles.currentStack]

    if (!current) {
      return
    }

    onStateChange({
      type: 'signed-in',
      profiles,
      current,
    })
  }

  const handleAbort = () => {
    onStateChange({
      type: 'signed-out',
    })
  }

  return <GrafanaCloudSignIn onSignIn={handleSignIn} onAbort={handleAbort} />
}
