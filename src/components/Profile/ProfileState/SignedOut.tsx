import { Text, Button, Flex, Box } from '@radix-ui/themes'
import { SigningInState } from './types'
import { css } from '@emotion/react'
import { GrafanaLogo } from '../GrafanaLogo'
import { GrafanaIcon } from '@/components/icons/GrafanaIcon'
import { ExternalLink } from '@/components/ExternalLink'
import { CheckIcon } from '@radix-ui/react-icons'
import { ReactNode } from 'react'

function Benefit({ children }: { children: ReactNode }) {
  return (
    <li
      css={css`
        display: flex;
        align-items: center;
        gap: var(--space-1);
      `}
    >
      <CheckIcon color="green" />
      {children}
    </li>
  )
}

function PromotionalText() {
  return (
    <Text as="div" align="center" size="2">
      With a Grafana Cloud account you can
      <ul
        css={css`
          list-style: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0;
        `}
      >
        <Benefit>Run tests at scale from anywhere in the world.</Benefit>
        <Benefit>Monitor test results in real-time.</Benefit>
        <Benefit>Analyze and explore test results.</Benefit>
      </ul>
    </Text>
  )
}
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

      <Flex direction="column" align="center" gap="2">
        <Box>
          <PromotionalText />
        </Box>
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
        <ExternalLink
          href={`${GRAFANA_COM_URL}/auth/sign-up/create-user?pg=k6`}
          size="2"
        >
          Create a free acount
        </ExternalLink>
      </Flex>
    </Flex>
  )
}
