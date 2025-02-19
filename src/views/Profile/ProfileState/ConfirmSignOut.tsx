import { Button, Flex, Heading } from '@radix-ui/themes'
import { ConfirmSignOutState, SignedInState, SignedOutState } from './types'

interface ConfirmSignOutProps {
  state: ConfirmSignOutState
  onStateChange: (state: SignedInState | SignedOutState) => void
}

export function ConfirmSignOut({ state, onStateChange }: ConfirmSignOutProps) {
  const handleSignOut = () => {
    window.studio.auth.signOut().catch((error) => {
      console.error('Failed to sign out', error)
    })

    onStateChange({
      type: 'signed-out',
    })
  }

  const handleCancel = () => {
    onStateChange({
      type: 'signed-in',
      user: state.user,
    })
  }

  return (
    <Flex direction="column" align="center" gap="5">
      <Heading mb="0">Are you sure you want to sign out?</Heading>
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
