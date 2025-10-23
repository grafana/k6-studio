import { Flex, Text, Box } from '@radix-ui/themes'
import { CircleCheckIcon } from 'lucide-react'

import { fadeIn, fadeInKeyframes, scaleUp } from '@/utils/animations'

export function SuccessOverlay() {
  return (
    <Box
      css={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'var(--gray-a3)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
        animation: fadeIn,
      }}
    >
      <Flex
        direction="column"
        align="center"
        gap="4"
        height="100%"
        justify="center"
      >
        <CircleCheckIcon
          css={{
            color: 'var(--grass-9)',
            width: '120px !important',
            height: '120px !important',
            animation: scaleUp,
          }}
          strokeWidth={1.5}
        />
        <Text
          size="6"
          weight="bold"
          css={{
            color: 'var(--grass-9)',
            animation: `${fadeInKeyframes} 0.5s ease-out 0.2s both`,
          }}
        >
          Validation successful
        </Text>
      </Flex>
    </Box>
  )
}
