import { K6Log } from '@/types'
import { css } from '@emotion/react'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Code, Flex, Text } from '@radix-ui/themes'

const colors: Record<K6Log['level'], string> = {
  info: 'green',
  debug: 'blue',
  warning: 'orange',
  error: 'red',
}

export function LogView({ logs }: { logs: K6Log[] }) {
  if (!logs.length) {
    return <NoLogsMessage />
  }

  // TODO: figure out a better key
  return (
    <Flex direction="column" gap="1">
      {logs.map((log, index) => (
        <Flex key={index} gap="3" asChild>
          <Code
            variant="ghost"
            size="2"
            css={css`
              padding: var(--space-1) var(--space-2);
              border-left: 3px solid var(--${colors[log.level]}-9);
              border-radius: 0;
            `}
          >
            <Flex flexShrink="0">{log.time}</Flex>
            <Text>{log.msg}</Text>
          </Code>
        </Flex>
      ))}
    </Flex>
  )
}

function NoLogsMessage() {
  return (
    <Box p="2">
      <Callout.Root>
        <Callout.Icon>
          <InfoCircledIcon />
        </Callout.Icon>
        <Callout.Text>Your logs will appear here.</Callout.Text>
      </Callout.Root>
    </Box>
  )
}
