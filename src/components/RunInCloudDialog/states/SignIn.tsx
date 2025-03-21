import { Flex } from '@radix-ui/themes'
import { useState } from 'react'

import { ProfileState } from '../../Profile/ProfileState'
import { SignInState } from '../../Profile/ProfileState/types'

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

  return (
    <Flex align="center" minHeight="500px">
      <ProfileState state={state} onStateChange={handleStateChange} />
    </Flex>
  )
}
