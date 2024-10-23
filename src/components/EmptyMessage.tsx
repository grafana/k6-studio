import { css } from '@emotion/react'
import { Flex, Text } from '@radix-ui/themes'
import { ReactNode } from 'react'
import grotIllustration from '@/assets/grot.svg'

interface EmptyMessageProps {
  message: ReactNode
}

export function EmptyMessage({ message }: EmptyMessageProps) {
  return (
    <Flex direction="column" align="center" gap="4" pt="8">
      <img
        src={grotIllustration}
        role="presentation"
        css={css`
          width: 50%;
          max-width: 300px;
        `}
      />
      {typeof message === 'string' ? (
        <Text color="gray" size="1">
          {message}
        </Text>
      ) : (
        message
      )}
    </Flex>
  )
}
