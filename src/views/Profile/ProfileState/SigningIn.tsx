import { SignedInState, SignedOutState, SigningInState } from './types'
import { GrafanaCloudSignIn } from '../GrafanaCloudSignIn'

interface SigningInStateProps {
  state: SigningInState
  onStateChange: (
    state: SignedInState | SigningInState | SignedOutState
  ) => void
}

export function SigningIn({ onStateChange }: SigningInStateProps) {
  const handleSignIn = () => {
    onStateChange({
      type: 'signed-in',
      user: {
        name: 'John Doe',
        email: 'johnny@doey.com',
      },
    })
  }

  const handleAbort = () => {
    onStateChange({
      type: 'signed-out',
    })
  }

  return <GrafanaCloudSignIn onSignIn={handleSignIn} onAbort={handleAbort} />
}
