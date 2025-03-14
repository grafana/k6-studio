import { useState } from 'react'
import { SignInState } from '../../Profile/ProfileState/types'
import { ProfileState } from '../../Profile/ProfileState'
import { Flex } from '@radix-ui/themes'

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
