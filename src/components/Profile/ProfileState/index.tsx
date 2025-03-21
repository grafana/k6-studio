import { exhaustive } from '@/utils/typescript'

import { ConfirmSignOut } from './ConfirmSignOut'
import { Loading } from './Loading'
import { SignedIn } from './SignedIn'
import { SignedOut } from './SignedOut'
import { SigningIn } from './SigningIn'
import { SignInState } from './types'

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
