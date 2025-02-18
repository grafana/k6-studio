import { Flex } from '@radix-ui/themes'
import { AuthorizationDeniedState } from '@/types/auth'
import { AuthenticationMessage } from './AuthenticationMessage'

interface AuthorizationDeniedProps {
  state: AuthorizationDeniedState
}

export function AuthorizationDenied(_props: AuthorizationDeniedProps) {
  return (
    <Flex direction="column" gap="2" minWidth="300px">
      <AuthenticationMessage>Authorization was denied.</AuthenticationMessage>
    </Flex>
  )
}
