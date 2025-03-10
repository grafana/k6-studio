import { useState } from 'react'
import { SignInState } from '../../Profile/ProfileState/types'
import { ProfileState } from '../../Profile/ProfileState'

export function SignIn() {
  const [state, setState] = useState<SignInState>({
    type: 'signed-out',
  })

  const handleStateChange = (state: SignInState) => {
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
