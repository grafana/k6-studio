import { K6Log } from '@/types'
import { InfoCircledIcon } from '@radix-ui/react-icons'
import { Box, Callout, Code, Flex, Text } from '@radix-ui/themes'

export function LogView({ logs }: { logs: K6Log[] }) {
  if (!logs.length) {
    return <NoLogsMessage />
  }

  // TODO: figure out a better key
  return (
    <Box>
      {logs.map((log, index) => (
        <Flex key={index} gap="3" mb="1" asChild>
          <Code variant="ghost" size="2">
            <Flex flexShrink="0">
              <LogLevelLine level={log.level} />
            </Flex>

            <Flex flexShrink="0">{log.time}</Flex>
            <Text>{log.msg}</Text>
          </Code>
        </Flex>
      ))}
    </Box>
  )
}

function LogLevelLine({ level }: { level: K6Log['level'] }) {
  const colors: Record<K6Log['level'], string> = {
    info: 'green',
    debug: 'blue',
    warning: 'orange',
    error: 'red',
  }

  return (
    <Box
      width="4px"
      height="100%"
      style={{ backgroundColor: `var(--${colors[level]}-8)` }}
    />
  )
}

function NoLogsMessage() {
  return (
    <Callout.Root>
      <Callout.Icon>
        <InfoCircledIcon />
      </Callout.Icon>
      <Callout.Text>Your logs will appear here.</Callout.Text>
    </Callout.Root>
  )
}
