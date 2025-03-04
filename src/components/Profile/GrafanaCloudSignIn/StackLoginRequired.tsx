import { Button, Flex, Text } from '@radix-ui/themes'
import { StackLoginRequiredState } from '@/types/auth'
import { ExternalLink } from '@/components/ExternalLink'
import { AuthenticationMessage } from './AuthenticationMessage'
import { css } from '@emotion/react'

interface StackLoginRequiredProps {
  state: StackLoginRequiredState
}

export function StackLoginRequired({ state }: StackLoginRequiredProps) {
  const appUrl = `${state.stack.url}/a/k6-app`

  const handleRetryClick = () => {
    window.studio.auth.retryStack()
  }

  return (
    <Flex direction="column" align="center" gap="2" maxWidth="360px">
      <AuthenticationMessage>
        <Text as="p" mb="1">
          You have never used Grafana Cloud k6 with{' '}
          <ExternalLink
            css={css`
              white-space: nowrap;
            `}
            href={appUrl}
          >
            {state.stack.url}
          </ExternalLink>{' '}
          before. In order to continue, you need to{' '}
          <ExternalLink href={appUrl}>access it in your browser</ExternalLink>{' '}
          and then try again.
        </Text>
      </AuthenticationMessage>
      <Button
        css={css`
          min-width: 200px;
        `}
        onClick={handleRetryClick}
      >
        Retry
      </Button>
    </Flex>
  )
}
