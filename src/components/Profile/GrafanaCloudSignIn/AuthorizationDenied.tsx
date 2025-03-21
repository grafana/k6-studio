import { Button, Flex } from '@radix-ui/themes'

import { AuthorizationDeniedState } from '@/types/auth'

import { AuthenticationMessage } from './AuthenticationMessage'

interface AuthorizationDeniedProps {
  state: AuthorizationDeniedState
  onRetry: () => void
}

export function AuthorizationDenied({ onRetry }: AuthorizationDeniedProps) {
  return (
    <Flex direction="column" gap="2" minWidth="300px">
      <AuthenticationMessage>Authorization was denied.</AuthenticationMessage>
      <Button onClick={onRetry}>Retry</Button>
    </Flex>
  )
}
