import { css } from '@emotion/react'
import {
  Button,
  Flex,
  Heading,
  Link as RadixLink,
  Text,
} from '@radix-ui/themes'
import { ChevronLeftIcon } from 'lucide-react'

import GrotCrashed from '@/assets/grot-crashed.svg'

import { ExternalLink } from './components/ExternalLink'

const handleOpenLogs = () => {
  window.studio.log.openLogFolder()
}

const handleRestart = () => {
  window.location.replace('/')
}

export function ErrorElement() {
  return (
    <Flex height="100dvh" justify="center" align="center" p="8">
      <Flex direction="column" align="center" gap="4">
        <Heading
          size="8"
          css={css`
            font-weight: 400;
          `}
        >
          Unexpected error
        </Heading>
        <img
          src={GrotCrashed}
          role="presentation"
          css={css`
            width: 375px;
          `}
        />
        <Text
          size="2"
          color="gray"
          align="center"
          css={css`
            max-width: 560px;
          `}
        >
          We apologize for the inconvenience. Please help us improve our
          application by reporting this issue on{' '}
          <ExternalLink href="https://github.com/grafana/k6-studio/issues">
            GitHub
          </ExternalLink>{' '}
          and attaching the tail of{' '}
          <RadixLink href="" onClick={handleOpenLogs}>
            your log file
          </RadixLink>
          .
        </Text>
        <Button onClick={handleRestart}>
          <ChevronLeftIcon />
          Go back
        </Button>
      </Flex>
    </Flex>
  )
}
