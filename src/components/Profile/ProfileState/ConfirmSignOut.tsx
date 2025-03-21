import { Button, Flex, Heading } from '@radix-ui/themes'

import { ConfirmSignOutState, SignedInState, SignedOutState } from './types'

interface ConfirmSignOutProps {
  state: ConfirmSignOutState
  onStateChange: (state: SignedInState | SignedOutState) => void
}

export function ConfirmSignOut({ state, onStateChange }: ConfirmSignOutProps) {
  const handleSignOut = async () => {
    try {
      const { current, profiles } = await window.studio.auth.signOut(
        state.stack
      )

      if (current === null) {
        onStateChange({
          type: 'signed-out',
        })

        return
      }

      onStateChange({
        type: 'signed-in',
        profiles,
        current,
      })
    } catch (error) {
      console.log('Error signing out', error)
    }
  }

  const handleCancel = () => {
    onStateChange({
      type: 'signed-in',
      profiles: state.profiles,
      current: state.stack,
    })
  }

  return (
    <Flex direction="column" align="center" gap="5">
      <Heading mb="0" align="center">
        Are you sure you want to sign out from {state.stack.name}?
      </Heading>
      <Flex gap="1" direction="column" width="150px">
        <Button color="red" onClick={handleSignOut}>
          Sign Out
        </Button>
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
      </Flex>
    </Flex>
  )
}
