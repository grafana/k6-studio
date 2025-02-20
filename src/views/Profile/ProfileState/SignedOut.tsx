import { Button, Flex } from '@radix-ui/themes'
import { SigningInState } from './types'
import { css } from '@emotion/react'
import { GrafanaLogo } from '../GrafanaLogo'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'

interface SignedOutStateProps {
  onSignIn: (state: SigningInState) => void
}

export function SignedOut({ onSignIn }: SignedOutStateProps) {
  const handleSignInClick = () => {
    onSignIn({
      type: 'signing-in',
      state: {
        type: 'initializing',
      },
    })
  }

  return (
    <Flex direction="column" align="center" gap="5">
      <GrafanaLogo />
      <Button
        css={css`
          gap: var(--space-2);
        `}
        size="2"
        onClick={handleSignInClick}
      >
        <GrafanaIcon />
        Sign in with Grafana Cloud
      </Button>
    </Flex>
  )
}
