import { Flex } from '@radix-ui/themes'
import { AuthenticationMessage } from './AuthenticationMessage'
import { SignOutRequiredState } from '@/types/auth'

interface SignOutRequiredProps {
  state: SignOutRequiredState
}

export function SignOutRequired(_props: SignOutRequiredProps) {
  return (
    <Flex direction="column" gap="2" minWidth="300px">
      <AuthenticationMessage>
        You are attempting to sign-in with a different account than the one you
        are currently signed-in to. Please sign out of the current account and
        try again.
      </AuthenticationMessage>
    </Flex>
  )
}
