import { useState } from 'react'
import { SignInState as ProfileSignInState } from '../Profile/ProfileState/types'
import { ProfileState } from '../Profile/ProfileState'

export function SignInState() {
  const [state, setState] = useState<ProfileSignInState>({
    type: 'signed-out',
  })

  const handleStateChange = (state: ProfileSignInState) => {
    if (state.type === 'signed-in') {
      window.studio.cloud.signedIn()

      return
    }

    if (state.type !== 'signing-in') {
      return
    }

    setState(state)
  }

  return <ProfileState state={state} onStateChange={handleStateChange} />
}
