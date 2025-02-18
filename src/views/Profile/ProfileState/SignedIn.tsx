import { Button, Flex, Heading } from '@radix-ui/themes'
import { Avatar } from '../Avatar'
import { SignedInState, SignedOutState } from './types'

interface SignedInStateProps {
  state: SignedInState
  onSignOut: (state: SignedOutState) => void
}

export function SignedIn({ state, onSignOut }: SignedInStateProps) {
  const handleSignOut = () => {
    window.studio.auth.signOut().catch((error) => {
      console.error('Failed to sign out', error)
    })

    onSignOut({
      type: 'signed-out',
    })
  }

  return (
    <Flex direction="column" align="center" gap="5">
      <Avatar />
      <Flex direction="column" align="center" gap="2">
        <Heading>Signed in as {state.profile.email}!</Heading>
        <Button size="2" variant="ghost" onClick={handleSignOut}>
          Sign out
        </Button>
      </Flex>
    </Flex>
  )
}
