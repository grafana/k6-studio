import { SignedInState, SignedOutState, SigningInState } from './types'
import { GrafanaCloudSignIn } from '../GrafanaCloudSignIn'
import { UserInfo } from '@/schemas/profile'

interface SigningInStateProps {
  state: SigningInState
  onStateChange: (
    state: SignedInState | SigningInState | SignedOutState
  ) => void
}

export function SigningIn({ onStateChange }: SigningInStateProps) {
  const handleSignIn = (user: UserInfo) => {
    onStateChange({
      type: 'signed-in',
      user,
    })
  }

  const handleAbort = () => {
    onStateChange({
      type: 'signed-out',
    })
  }

  return <GrafanaCloudSignIn onSignIn={handleSignIn} onAbort={handleAbort} />
}
