import { Flex } from '@radix-ui/themes'

import { UnexpectedErrorState } from '@/types/auth'

import { AuthenticationMessage } from './AuthenticationMessage'

interface UnexpectedErrorProps {
  state: UnexpectedErrorState
}

export function UnexpectedError(_props: UnexpectedErrorProps) {
  return (
    <Flex direction="column" gap="2" minWidth="300px">
      <AuthenticationMessage error>
        An unexpected error occurred.
      </AuthenticationMessage>
    </Flex>
  )
}
