import { css } from '@emotion/react'
import { Flex, Text } from '@radix-ui/themes'
import { ReactNode } from 'react'
import grotIllustration from '@/assets/grot.svg'

interface NoRequestsMessageProps {
  noRequestsMessage?: ReactNode
}

export function NoRequestsMessage({
  noRequestsMessage = 'Your requests will appear here.',
}: NoRequestsMessageProps) {
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
      {typeof noRequestsMessage === 'string' ? (
        <Text color="gray" size="1">
          {noRequestsMessage}
        </Text>
      ) : (
        noRequestsMessage
      )}
    </Flex>
  )
}
