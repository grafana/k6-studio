import { Callout, Flex } from '@radix-ui/themes'
import { AwaitingAuthorizationState } from './types'
import { css } from '@emotion/react'

interface AwaitingAuthorizationProps {
  state: AwaitingAuthorizationState
}

export function AwaitingAuthorization({ state }: AwaitingAuthorizationProps) {
  return (
    <Flex direction="column" align="center" gap="2">
      <div
        css={css`
          text-align: center;
        `}
      >
        Make sure that code on the authorization page matches this code:{' '}
      </div>
      <Callout.Root
        css={css`
          align-self: stretch;
          justify-content: center;
        `}
        size="3"
      >
        <Callout.Text align="center" weight="medium" size="7">
          {state.code}
        </Callout.Text>
      </Callout.Root>
    </Flex>
  )
}
