import { Flex, FlexProps, Text } from '@radix-ui/themes'
import { ReactNode } from 'react'

import grotIllustration from '@/assets/grot.svg'

const illustrations = {
  notFound: {
    src: grotIllustration,
    defaultWidth: 250,
  },
} as const

type EmptyMessageProps = FlexProps & {
  message: ReactNode
  illustration?: keyof typeof illustrations
  action?: ReactNode
}

export function EmptyMessage({
  message,
  action,
  illustration = 'notFound',
  ...flexProps
}: EmptyMessageProps) {
  return (
    <Flex direction="column" align="center" gap="4" pt="8" {...flexProps}>
      <img
        src={illustrations[illustration].src}
        role="presentation"
        css={{ maxWidth: illustrations[illustration].defaultWidth }}
      />
      {typeof message === 'string' ? (
        <Text color="gray" size="2">
          {message}
        </Text>
      ) : (
        message
      )}
      {action}
    </Flex>
  )
}
