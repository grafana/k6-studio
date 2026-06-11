import { Flex, Text } from '@radix-ui/themes'

import grotCrashed from '@/assets/grot-crashed.svg'

interface ErrorMessageProps {
  className?: string
  title: string
  message: React.ReactNode
  children?: React.ReactNode
}

export function ErrorMessage({
  className,
  title,
  message,
  children,
}: ErrorMessageProps) {
  return (
    <Flex
      className={className}
      direction="column"
      align="center"
      gap="6"
      justify="center"
      height="100%"
      p="6"
    >
      <img
        css={{
          maxWidth: '200px',
          transform: 'scaleX(-1)',
        }}
        src={grotCrashed}
        aria-label="Error illustration"
      />

      <Flex direction="column" align="center" gap="3" maxWidth="400px">
        <Text size="4" weight="medium" align="center">
          {title}
        </Text>

        <Text size="2" color="gray" align="center">
          {message}
        </Text>

        <Flex gap="3" mt="4">
          {children}
        </Flex>
      </Flex>
    </Flex>
  )
}
