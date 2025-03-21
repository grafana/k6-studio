import { Button, Flex } from '@radix-ui/themes'

import { TimedOutState } from '@/types/auth'

import { AuthenticationMessage } from './AuthenticationMessage'

interface TimedOutProps {
  state: TimedOutState
  onRetry: () => void
}

export function TimedOut({ onRetry }: TimedOutProps) {
  return (
    <Flex direction="column" gap="2" minWidth="300px">
      <AuthenticationMessage>
        The session has expired. <br /> Please try again.
      </AuthenticationMessage>
      <Button onClick={onRetry}>Retry</Button>
    </Flex>
  )
}
