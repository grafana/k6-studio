import { css } from '@emotion/react'
import { Callout, Flex, Text } from '@radix-ui/themes'

import { AwaitingAuthorizationState } from '@/types/auth'

interface AwaitingAuthorizationProps {
  state: AwaitingAuthorizationState
}

export function AwaitingAuthorization({ state }: AwaitingAuthorizationProps) {
  return (
    <Flex direction="column" align="center" gap="2">
      <Text align="center">Complete the sign-in in your browser.</Text>
      <Callout.Root
        css={css`
          align-self: stretch;
          justify-content: center;
        `}
        size="3"
      >
        <Callout.Text align="center">
          Your code is <br />
          <Text align="center" weight="bold" size="6">
            {state.code}
          </Text>
        </Callout.Text>
      </Callout.Root>
    </Flex>
  )
}
