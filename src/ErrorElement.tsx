import {
  Button,
  Flex,
  Heading,
  Link as RadixLink,
  Text,
} from '@radix-ui/themes'
import { css } from '@emotion/react'

import GrotCrashed from '@/assets/grot-crashed.svg'
import { ArrowLeftIcon } from '@radix-ui/react-icons'

const handleCreateIssue = () => {
  window.studio.browser.openExternalLink(
    'https://github.com/grafana/k6-studio/issues'
  )
}

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
          <RadixLink href="" onClick={handleCreateIssue}>
            GitHub
          </RadixLink>{' '}
          and attaching the tail of{' '}
          <RadixLink href="" onClick={handleOpenLogs}>
            your log file
          </RadixLink>
          .
        </Text>
        <Button onClick={handleRestart}>
          <ArrowLeftIcon />
          Go back
        </Button>
      </Flex>
    </Flex>
  )
}
