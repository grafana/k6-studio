import { exhaustive } from '@/utils/typescript'
import { Loading } from './Loading'
import { SignedOut } from './SignedOut'
import { SigningIn } from './SigningIn'
import { SignedIn } from './SignedIn'
import { SignInState } from './types'
import { ConfirmSignOut } from './ConfirmSignOut'

interface ProfileStateProps {
  state: SignInState
  onStateChange: (state: SignInState) => void
}

export function ProfileState({ state, onStateChange }: ProfileStateProps) {
  switch (state.type) {
    case 'loading':
      return <Loading onLoaded={onStateChange} />

    case 'signed-out':
      return <SignedOut onSignIn={onStateChange} />

    case 'signed-in':
      return <SignedIn state={state} onStateChange={onStateChange} />

    case 'signing-in':
      return <SigningIn state={state} onStateChange={onStateChange} />

    case 'confirm-sign-out':
      return <ConfirmSignOut state={state} onStateChange={onStateChange} />

    default:
      return exhaustive(state)
  }
}
