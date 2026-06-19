import { Box, Flex } from '@radix-ui/themes'

import { blinkKeyframes } from '@/utils/animations'

const DOT_DELAYS = [0, 150, 300]

/**
 * Three blinking dots shown while the agent is still streaming, aligned under
 * the log's timestamp column.
 */
export function TypingDots() {
  return (
    <Flex gap="3" px="3" py="1" align="center" aria-label="Working">
      <Box css={{ width: 44, flexShrink: 0 }} />
      <Flex gap="1" align="center">
        {DOT_DELAYS.map((delay) => (
          <Box
            key={delay}
            css={{
              width: 5,
              height: 5,
              borderRadius: '100%',
              backgroundColor: 'var(--gray-9)',
              animation: `${blinkKeyframes} 1s ease-in-out infinite`,
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </Flex>
    </Flex>
  )
}
