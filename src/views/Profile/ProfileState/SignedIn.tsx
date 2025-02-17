import { Box, Button, Flex, Heading } from '@radix-ui/themes'
import { Avatar } from '../Avatar'
import { SignedInState, SignedOutState } from './types'

interface SignedInStateProps {
  state: SignedInState
  onSignOut: (state: SignedOutState) => void
}

export function SignedIn({ state, onSignOut }: SignedInStateProps) {
  const handleSignOut = () => {
    onSignOut({
      type: 'signed-out',
    })
  }

  return (
    <Flex direction="column" align="center" gap="4">
      <Avatar />
      <Flex direction="column" align="center" gap="2">
        <Heading>Signed in as {state.user.name}!</Heading>
        <Box>Your email is {state.user.email}</Box>
        <Button size="2" variant="ghost" onClick={handleSignOut}>
          Sign out
        </Button>
      </Flex>
    </Flex>
  )
}
