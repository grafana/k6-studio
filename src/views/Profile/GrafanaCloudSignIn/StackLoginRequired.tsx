import { Flex } from '@radix-ui/themes'
import { StackLoginRequiredState } from '@/types/auth'
import { ExternalLink } from '@/components/ExternalLink'
import { AuthenticationMessage } from './AuthenticationMessage'
import { css } from '@emotion/react'

interface StackLoginRequiredProps {
  state: StackLoginRequiredState
}

export function StackLoginRequired({ state }: StackLoginRequiredProps) {
  return (
    <Flex direction="column" align="center" gap="2">
      <AuthenticationMessage>
        You have not logged in to the stack{' '}
        <ExternalLink
          css={css`
            white-space: nowrap;
          `}
          href={state.stack.url}
        >
          {state.stack.name}
        </ExternalLink>{' '}
        before. Login to the stack then try again.
      </AuthenticationMessage>
    </Flex>
  )
}
