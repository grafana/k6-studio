import { SignedInState, SignedOutState, SigningInState } from './types'
import { GrafanaCloudSignIn } from '../GrafanaCloudSignIn'
import { CloudProfile } from '@/schemas/profile'

interface SigningInStateProps {
  state: SigningInState
  onStateChange: (
    state: SignedInState | SigningInState | SignedOutState
  ) => void
}

export function SigningIn({ onStateChange }: SigningInStateProps) {
  const handleSignIn = (profile: CloudProfile) => {
    onStateChange({
      type: 'signed-in',
      profile,
    })
  }

  const handleAbort = () => {
    onStateChange({
      type: 'signed-out',
    })
  }

  return <GrafanaCloudSignIn onSignIn={handleSignIn} onAbort={handleAbort} />
}
